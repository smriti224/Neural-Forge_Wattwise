const classroomData = require('../store/classroomStore');
const timetableData = require('../store/timetableStore');
const roomData = require('../store/roomStore');

const MAX_OCCUPANCY = 60;
const LOW_OCCUPANCY_LIMIT = 15; // 25% of 60 students
const ENERGY_COST_PER_KWH = 8;
const DEVICE_KWH = { ac: 1.5, lights: 0.1, fans: 0.075 };

function clampOccupancy(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(MAX_OCCUPANCY, number));
}

function getOccupancyPercentage(occupancy) {
  return Math.round((clampOccupancy(occupancy) / MAX_OCCUPANCY) * 100);
}

function getOccupancyStatus(occupancy) {
  const safeOccupancy = clampOccupancy(occupancy);
  if (safeOccupancy === 0) return 'empty';
  if (safeOccupancy < LOW_OCCUPANCY_LIMIT) return 'low';
  return 'normal';
}

function upsertRoom(room_id, floor = 'Floor 1') {
  const normalizedId = String(room_id).trim();
  if (!normalizedId) return null;

  let room = roomData.find((r) => r.room_id === normalizedId);

  if (!room) {
    room = {
      room_id: normalizedId,
      floor: floor || 'Floor 1',
      max_occupancy: MAX_OCCUPANCY,
      created_at: new Date().toISOString()
    };
    roomData.push(room);
  } else if (floor) {
    room.floor = floor;
    room.max_occupancy = MAX_OCCUPANCY;
  }

  return room;
}

function getRoom(room_id) {
  return roomData.find((room) => room.room_id === room_id) || null;
}

function getAllKnownRoomIds() {
  const ids = new Set();
  roomData.forEach((room) => ids.add(room.room_id));
  classroomData.forEach((record) => ids.add(record.room_id));
  timetableData.forEach((entry) => ids.add(entry.room_id));
  return Array.from(ids).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function getLatestRecord(room_id) {
  const records = classroomData
    .filter((record) => record.room_id === room_id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (records.length === 0) return null;
  return records[records.length - 1];
}

function getTimeOfDay(timestamp = new Date()) {
  const hour = new Date(timestamp).getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function isDaytime(timestamp = new Date()) {
  const timeOfDay = getTimeOfDay(timestamp);
  return timeOfDay === 'morning' || timeOfDay === 'afternoon';
}

function getDayAndTime(timestamp = new Date()) {
  const date = new Date(timestamp);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return { day, current_time: `${hh}:${mm}` };
}

function getCurrentClassSlot(room_id, timestamp = new Date()) {
  const { day, current_time } = getDayAndTime(timestamp);
  const entries = timetableData.filter((entry) => entry.room_id === room_id && entry.day === day);

  for (const entry of entries) {
    for (const slot of entry.slots || []) {
      if (current_time >= slot.start_time && current_time < slot.end_time) {
        return {
          active: true,
          day,
          current_time,
          slot
        };
      }
    }
  }

  return {
    active: false,
    day,
    current_time,
    slot: null
  };
}

function getScheduleStatus(room_id, timestamp = new Date()) {
  return getCurrentClassSlot(room_id, timestamp).active;
}

function estimateEnergyKwh(devices = {}) {
  return Object.keys(DEVICE_KWH).reduce((total, device) => {
    return total + (devices[device] ? DEVICE_KWH[device] : 0);
  }, 0);
}

function getExpectedDeviceState(record, room_id, timestamp = new Date()) {
  const occupancy = clampOccupancy(record?.occupancy ?? 0);
  const daytime = isDaytime(timestamp);
  const scheduleActive = getScheduleStatus(room_id, timestamp);
  const isEmpty = occupancy === 0;
  const isLowOccupancy = occupancy > 0 && occupancy < LOW_OCCUPANCY_LIMIT;
  const isHighOccupancy = occupancy >= Math.floor(MAX_OCCUPANCY * 0.5);

  // No class right now or empty room means everything should be OFF.
  if (!scheduleActive || isEmpty) {
    return { lights: false, fans: false, ac: false };
  }

  // Class is running, but room is underused.
  if (isLowOccupancy) {
    return {
      lights: !daytime,
      fans: true,
      ac: false
    };
  }

  // Class is running and room has normal/high occupancy.
  return {
    lights: !daytime,
    fans: true,
    ac: isHighOccupancy
  };
}

function computeFlags(record, room_id, timestamp = new Date()) {
  const flags = [];
  const occupancy = clampOccupancy(record.occupancy);
  const { devices } = record;
  const daytime = isDaytime(timestamp);
  const classSlot = getCurrentClassSlot(room_id, timestamp);
  const expected = getExpectedDeviceState(record, room_id, timestamp);
  const occupancyStatus = getOccupancyStatus(occupancy);

  if (!classSlot.active && (devices.ac || devices.lights || devices.fans)) {
    flags.push({
      type: 'CRITICAL',
      message: `No class is scheduled right now in room ${room_id}, but devices are ON`
    });
  }

  if (occupancy === 0) {
    if (devices.ac) flags.push({ type: 'CRITICAL', message: `AC is ON in room ${room_id} but the room is empty` });
    if (devices.lights) flags.push({ type: 'CRITICAL', message: `Lights are ON in room ${room_id} but the room is empty` });
    if (devices.fans) flags.push({ type: 'CRITICAL', message: `Fans are ON in room ${room_id} but the room is empty` });
  }

  if (occupancyStatus === 'low' && devices.ac && !expected.ac) {
    flags.push({ type: 'WARNING', message: `AC is ON in room ${room_id}, but occupancy is low (${occupancy}/${MAX_OCCUPANCY})` });
  }

  if (daytime && devices.lights && !expected.lights) {
    flags.push({ type: 'WARNING', message: `Lights are ON in room ${room_id} during daytime; natural light may be sufficient` });
  }

  if (devices.ac && !expected.ac && occupancy > 0) {
    flags.push({ type: 'WARNING', message: `AC can be turned OFF for current room conditions` });
  }

  if (flags.length === 0) {
    flags.push({ type: 'INFO', message: `Room ${room_id} is operating efficiently against the live timetable` });
  }

  return flags;
}

function computeEfficiencyScore(record, room_id, timestamp = new Date()) {
  let score = 100;
  const occupancy = clampOccupancy(record.occupancy);
  const { devices } = record;
  const daytime = isDaytime(timestamp);
  const scheduleActive = getScheduleStatus(room_id, timestamp);

  if (!scheduleActive && (devices.ac || devices.lights || devices.fans)) score -= 40;
  if (occupancy === 0 && (devices.ac || devices.lights || devices.fans)) score -= 50;
  if (occupancy > 0 && occupancy < LOW_OCCUPANCY_LIMIT && devices.ac) score -= 20;
  if (daytime && devices.lights) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getCategory(score) {
  if (score >= 80) return 'optimal';
  if (score >= 50) return 'moderate';
  return 'inefficient';
}

function getPeriodStart(period = 'today') {
  const now = new Date();
  const start = new Date(now);

  if (period === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === 'this_week') {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function filterRecordsByPeriod(records, period = 'today') {
  const start = getPeriodStart(period);
  return records.filter((record) => new Date(record.timestamp) >= start);
}

module.exports = {
  MAX_OCCUPANCY,
  LOW_OCCUPANCY_LIMIT,
  ENERGY_COST_PER_KWH,
  DEVICE_KWH,
  clampOccupancy,
  getOccupancyPercentage,
  getOccupancyStatus,
  upsertRoom,
  getRoom,
  getAllKnownRoomIds,
  getLatestRecord,
  getTimeOfDay,
  isDaytime,
  getDayAndTime,
  getCurrentClassSlot,
  getScheduleStatus,
  estimateEnergyKwh,
  getExpectedDeviceState,
  computeFlags,
  computeEfficiencyScore,
  getCategory,
  filterRecordsByPeriod
};
