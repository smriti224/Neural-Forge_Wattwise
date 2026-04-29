const express = require("express");
const multer = require("multer");

const {
    uploadTimetable
} = require("../controllers/timetableUploadController");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post("/", upload.single("file"), uploadTimetable);

module.exports = router;