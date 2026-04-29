const express = require('express');
const router = express.Router();

const { getLiveAnalysis } = require('../controllers/liveAnalysisController');

router.get('/:room_id', getLiveAnalysis);

module.exports = router;