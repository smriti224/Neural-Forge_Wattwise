const { getLatestRecord, getExpectedDeviceState, getCurrentClassSlot } = require('../utils/helpers');

const labelMap = {
  ac: 'AC',
  lights: 'Lights',
  fans: 'Fans'
};

const actionMap = {
  ac: 'TURN_OFF_AC',
  lights: 'TURN_OFF_LIGHTS',
  fans: 'REDUCE_FANS'
};

const getRecommendations = (req, res) => {
  const { room_id } = req.params;
  const record = getLatestRecord(room_id);

  if (!record) {
    return res.status(404).json({
      status: 'error',
      message: `No data found for room ${room_id}`,
      errors: []
    });
  }

  const now = new Date();
  const expected = getExpectedDeviceState(record, room_id, now);
  const classSlot = getCurrentClassSlot(room_id, now);
  const recommendations = [];

  for (const device of ['ac', 'lights', 'fans']) {
    if (record.devices[device] && !expected[device]) {
      recommendations.push({
        action: actionMap[device],
        reason: classSlot.active
          ? `Room ${room_id} has ${labelMap[device]} ON, but live timetable and occupancy do not require it`
          : `No class is scheduled right now in room ${room_id} — ${labelMap[device]} should be turned off`
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      action: 'NO_ACTION',
      reason: `Room ${room_id} is aligned with the live timetable and occupancy level`
    });
  }

  return res.status(200).json({
    status: 'success',
    data: { room_id, recommendations }
  });
};

module.exports = { getRecommendations };
