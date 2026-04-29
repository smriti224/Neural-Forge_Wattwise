const classroomData = require('../store/classroomStore');
const {
  MAX_OCCUPANCY,
  clampOccupancy,
  getOccupancyPercentage,
  upsertRoom
} = require('../utils/helpers');

const submitClassroomData = (req, res) => {
  const { room_id, timestamp, occupancy, devices, floor } = req.body;
  const errors = [];

  if (!room_id || typeof room_id !== 'string') {
    errors.push('room_id is required and must be a string');
  }

  if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
    errors.push('timestamp is required and must be a valid ISO 8601 string');
  }

  if (occupancy === undefined || occupancy === null || typeof occupancy !== 'number' || Number.isNaN(occupancy)) {
    errors.push('occupancy is required and must be a number');
  } else if (occupancy < 0 || occupancy > MAX_OCCUPANCY) {
    errors.push(`occupancy must be between 0 and ${MAX_OCCUPANCY}`);
  }

  if (
    !devices ||
    typeof devices !== 'object' ||
    Array.isArray(devices) ||
    typeof devices.lights !== 'boolean' ||
    typeof devices.fans !== 'boolean' ||
    typeof devices.ac !== 'boolean'
  ) {
    errors.push('devices is required and must contain lights, fans, and ac as booleans');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing or invalid fields',
      errors
    });
  }

  const safeOccupancy = clampOccupancy(occupancy);
  const room = upsertRoom(room_id, floor || 'Floor 1');

  const record = {
    room_id,
    timestamp,
    occupancy: safeOccupancy,
    max_occupancy: MAX_OCCUPANCY,
    occupancy_percentage: getOccupancyPercentage(safeOccupancy),
    floor: room.floor,
    devices
  };

  classroomData.push(record);

  return res.status(201).json({
    status: 'success',
    data: {
      room_id,
      floor: room.floor,
      max_occupancy: MAX_OCCUPANCY,
      occupancy: safeOccupancy,
      occupancy_percentage: record.occupancy_percentage,
      stored: true
    }
  });
};

module.exports = { submitClassroomData };
