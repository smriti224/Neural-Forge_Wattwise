const express = require('express');
const router = express.Router();
const { getWasteFlags } = require('../controllers/wasteController');

router.get('/:room_id', getWasteFlags);

module.exports = router;