const express = require('express');
const router = express.Router();
const { getWasteOverview, getEfficiencyOverview, getComparison } = require('../controllers/analyticsController');

router.get('/waste-overview', getWasteOverview);
router.get('/efficiency', getEfficiencyOverview);
router.get('/comparison/:room_id', getComparison);

module.exports = router;