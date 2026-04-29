const classroomData = require('../store/classroomStore');
const {
  DEVICE_KWH,
  ENERGY_COST_PER_KWH,
  getAllKnownRoomIds,
  getLatestRecord,
  computeEfficiencyScore,
  getCategory,
  getExpectedDeviceState,
  estimateEnergyKwh,
  filterRecordsByPeriod,
  getCurrentClassSlot,
  getOccupancyPercentage,
  getOccupancyStatus
} = require('../utils/helpers');

const getWasteOverview = (req, res) => {
  const records = filterRecordsByPeriod(classroomData, 'today');
  let total_wasted = 0;
  let total_saved = 0;

  for (const record of records) {
    const expected = getExpectedDeviceState(record, record.room_id, new Date());
    const actualKwh = estimateEnergyKwh(record.devices);
    const expectedKwh = estimateEnergyKwh(expected);
    const difference = Math.max(0, actualKwh - expectedKwh);

    total_wasted += difference;
    total_saved += difference;
  }

  return res.status(200).json({
    status: 'success',
    data: {
      total_wasted: Number(total_wasted.toFixed(2)),
      total_saved: Number(total_saved.toFixed(2)),
      total_cost_saved_inr: Math.round(total_saved * ENERGY_COST_PER_KWH),
      unit: 'kWh'
    }
  });
};

const getEfficiencyOverview = (req, res) => {
  const roomIds = getAllKnownRoomIds();

  const result = roomIds.map((room_id) => {
    const record = getLatestRecord(room_id);
    const liveClass = getCurrentClassSlot(room_id, new Date());

    if (!record) {
      return {
        room_id,
        floor: 'Floor 1',
        max_occupancy: 60,
        occupancy: 0,
        occupancy_percentage: 0,
        occupancy_status: 'empty',
        efficiency_score: null,
        category: 'no data',
        schedule_status: liveClass.active ? 'active' : 'inactive',
        current_class: liveClass.slot
      };
    }

    const efficiency_score = computeEfficiencyScore(record, room_id, new Date());

    return {
      room_id,
      floor: record.floor || 'Floor 1',
      max_occupancy: record.max_occupancy || 60,
      occupancy: record.occupancy,
      occupancy_percentage: getOccupancyPercentage(record.occupancy),
      occupancy_status: getOccupancyStatus(record.occupancy),
      efficiency_score,
      category: getCategory(efficiency_score),
      schedule_status: liveClass.active ? 'active' : 'inactive',
      current_class: liveClass.slot
    };
  });

  return res.status(200).json({ status: 'success', data: result });
};

const getComparison = (req, res) => {
  const { room_id } = req.params;
  const period = req.query.period || 'today';
  const VALID_PERIODS = ['today', 'this_week', 'this_month'];

  if (!VALID_PERIODS.includes(period)) {
    return res.status(400).json({
      status: 'error',
      message: 'period must be today | this_week | this_month',
      errors: []
    });
  }

  const roomRecords = classroomData.filter((record) => record.room_id === room_id);
  const records = filterRecordsByPeriod(roomRecords, period);

  if (roomRecords.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: `No data found for room ${room_id}`,
      errors: []
    });
  }

  let before_kwh = 0;
  let after_kwh = 0;

  for (const record of records.length > 0 ? records : roomRecords) {
    const expected = getExpectedDeviceState(record, room_id, new Date(record.timestamp));
    before_kwh += estimateEnergyKwh(record.devices);
    after_kwh += estimateEnergyKwh(expected);
  }

  const liveClass = getCurrentClassSlot(room_id, new Date());
  const reduction = before_kwh > 0 ? ((before_kwh - after_kwh) / before_kwh) * 100 : 0;

  return res.status(200).json({
    status: 'success',
    data: {
      room_id,
      period,
      before_kwh: Number(before_kwh.toFixed(2)),
      after_kwh: Number(after_kwh.toFixed(2)),
      reduction_percent: Number(Math.max(0, reduction).toFixed(1)),
      unit: 'kWh',
      live_checked_at: new Date().toISOString(),
      is_class_live_now: liveClass.active,
      current_day: liveClass.day,
      current_time: liveClass.current_time,
      current_class: liveClass.slot,
      device_reference_kwh: DEVICE_KWH
    }
  });
};

module.exports = { getWasteOverview, getEfficiencyOverview, getComparison };
