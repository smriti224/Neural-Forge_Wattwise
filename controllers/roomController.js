const roomData = require('../store/roomStore');
const classroomData = require('../store/classroomStore');
const timetableData = require('../store/timetableStore');
const {
  MAX_OCCUPANCY,
  upsertRoom,
  getAllKnownRoomIds,
  getLatestRecord,
  computeEfficiencyScore,
  getCategory,
  getOccupancyPercentage,
  getOccupancyStatus,
  getCurrentClassSlot
} = require('../utils/helpers');

function buildRoomPayload(room_id) {
  const meta = roomData.find((room) => room.room_id === room_id) || {
    room_id,
    floor: 'Floor 1',
    max_occupancy: MAX_OCCUPANCY
  };

  const latest = getLatestRecord(room_id);
  const score = latest ? computeEfficiencyScore(latest, room_id, new Date()) : null;
  const liveClass = getCurrentClassSlot(room_id, new Date());

  return {
    room_id,
    floor: meta.floor || latest?.floor || 'Floor 1',
    max_occupancy: MAX_OCCUPANCY,
    occupancy: latest?.occupancy ?? 0,
    occupancy_percentage: getOccupancyPercentage(latest?.occupancy ?? 0),
    occupancy_status: getOccupancyStatus(latest?.occupancy ?? 0),
    devices: latest?.devices || { lights: false, fans: false, ac: false },
    latest_timestamp: latest?.timestamp || null,
    schedule_status: liveClass.active ? 'active' : 'inactive',
    current_class: liveClass.slot,
    efficiency_score: score,
    category: score === null ? 'no data' : getCategory(score)
  };
}

const getRooms = (req, res) => {
  const roomIds = getAllKnownRoomIds();
  const rooms = roomIds.map(buildRoomPayload);

  return res.status(200).json({
    status: 'success',
    data: rooms
  });
};

const createRoom = (req, res) => {
  const { room_id, floor } = req.body;
  const errors = [];

  if (!room_id || typeof room_id !== 'string') {
    errors.push('room_id is required and must be a string');
  }

  if (floor !== undefined && typeof floor !== 'string') {
    errors.push('floor must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', message: 'Missing or invalid fields', errors });
  }

  const room = upsertRoom(room_id, floor || 'Floor 1');

  return res.status(201).json({
    status: 'success',
    data: {
      ...room,
      max_occupancy: MAX_OCCUPANCY
    }
  });
};

const deleteRoom = (req, res) => {
  const { room_id } = req.params;

  for (let i = roomData.length - 1; i >= 0; i--) {
    if (roomData[i].room_id === room_id) roomData.splice(i, 1);
  }

  for (let i = classroomData.length - 1; i >= 0; i--) {
    if (classroomData[i].room_id === room_id) classroomData.splice(i, 1);
  }

  for (let i = timetableData.length - 1; i >= 0; i--) {
    if (timetableData[i].room_id === room_id) timetableData.splice(i, 1);
  }

  return res.status(200).json({
    status: 'success',
    data: { room_id, deleted: true }
  });
};

module.exports = { getRooms, createRoom, deleteRoom };
