const {
  MAX_OCCUPANCY,
  getLatestRecord,
  isDaytime,
  getExpectedDeviceState,
  getCurrentClassSlot,
  getOccupancyPercentage,
  getOccupancyStatus
} = require('../utils/helpers');

const getAnalysis = (req, res) => {
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
  const { occupancy, devices } = record;
  const classSlot = getCurrentClassSlot(room_id, now);
  const is_empty = occupancy === 0;
  const is_low_occupancy = occupancy > 0 && occupancy < 15;
  const is_daytime = isDaytime(now);

  const actual_device_state = {
    lights: devices.lights,
    fans: devices.fans,
    ac: devices.ac
  };

  const expected_device_state = getExpectedDeviceState(record, room_id, now);

  return res.status(200).json({
    status: 'success',
    data: {
      room_id,
      timestamp: record.timestamp,
      live_checked_at: now.toISOString(),
      occupancy,
      max_occupancy: MAX_OCCUPANCY,
      occupancy_percentage: getOccupancyPercentage(occupancy),
      occupancy_status: getOccupancyStatus(occupancy),
      floor: record.floor || 'Floor 1',
      is_empty,
      is_low_occupancy,
      is_daytime,
      schedule_status: classSlot.active ? 'active' : 'inactive',
      current_day: classSlot.day,
      current_time: classSlot.current_time,
      current_class: classSlot.slot,
      actual_device_state,
      expected_device_state
    }
  });
};

module.exports = { getAnalysis };
