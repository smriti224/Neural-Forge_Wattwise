const { getLatestRecord, computeEfficiencyScore, getCategory } = require('../utils/helpers');

const getEfficiency = (req, res) => {
  const { room_id } = req.params;
  const record = getLatestRecord(room_id);

  if (!record) {
    return res.status(404).json({
      status: 'error',
      message: `No data found for room ${room_id}`,
      errors: []
    });
  }

  const efficiency_score = computeEfficiencyScore(record, room_id, new Date());
  const category = getCategory(efficiency_score);

  return res.status(200).json({
    status: 'success',
    data: { room_id, efficiency_score, category }
  });
};

module.exports = { getEfficiency };
