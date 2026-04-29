const express = require('express');
const router = express.Router();
const { getEfficiency } = require('../controllers/efficiencyController');

router.get('/:room_id', getEfficiency);

module.exports = router;