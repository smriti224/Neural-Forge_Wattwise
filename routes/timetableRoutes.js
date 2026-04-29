const express = require("express");

const {
    saveTimetable,
    getTimetableByRoom
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/", saveTimetable);
router.get("/:room_id", getTimetableByRoom);

module.exports = router;