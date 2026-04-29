const express = require('express');
const router = express.Router();
const { getAnalysis } = require('../controllers/analysisController');

router.get('/:room_id', getAnalysis);

module.exports = router;