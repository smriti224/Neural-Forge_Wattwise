const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/:room_id', getRecommendations);

module.exports = router;