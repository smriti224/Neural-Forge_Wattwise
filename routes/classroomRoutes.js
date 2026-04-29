const express = require('express');
const router = express.Router();
const { submitClassroomData } = require('../controllers/classroomController');

router.post('/data', submitClassroomData);

module.exports = router;