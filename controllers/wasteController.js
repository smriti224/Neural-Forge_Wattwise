const { getLatestRecord, computeFlags } = require('../utils/helpers');

const getWasteFlags = (req, res) => {
  const { room_id } = req.params;
  const record = getLatestRecord(room_id);

  if (!record) {
    return res.status(404).json({
      status: 'error',
      message: `No data found for room ${room_id}`,
      errors: []
    });
  }

  const waste_flags = computeFlags(record, room_id, new Date());

  return res.status(200).json({
    status: 'success',
    data: { room_id, waste_flags }
  });
};

module.exports = { getWasteFlags };
