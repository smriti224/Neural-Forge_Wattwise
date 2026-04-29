const timetableData = require("../store/timetableStore");

const saveTimetable = (req, res) => {
    try {
        const { room_id, day, slots } = req.body;

        if (!room_id || !day || !Array.isArray(slots)) {
            return res.status(400).json({
                status: "error",
                message: "room_id, day and slots[] are required",
                errors: []
            });
        }

        const cleanDay = String(day).toLowerCase();

        const existingIndex = timetableData.findIndex(
            (entry) =>
                String(entry.room_id) === String(room_id) &&
                String(entry.day).toLowerCase() === cleanDay
        );

        const entry = {
            room_id: String(room_id),
            day: cleanDay,
            slots: slots.map((slot) => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
                label: slot.label || "Class"
            }))
        };

        if (existingIndex >= 0) {
            timetableData[existingIndex] = entry;
        } else {
            timetableData.push(entry);
        }

        return res.status(200).json({
            status: "success",
            message: "Timetable saved successfully",
            data: entry
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message || "Unable to save timetable",
            errors: []
        });
    }
};

const getTimetableByRoom = (req, res) => {
    try {
        const { room_id } = req.params;

        const schedule = timetableData.filter(
            (entry) => String(entry.room_id) === String(room_id)
        );

        return res.status(200).json({
            status: "success",
            data: {
                room_id: String(room_id),
                schedule
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message || "Unable to fetch timetable",
            errors: []
        });
    }
};

module.exports = {
    saveTimetable,
    getTimetableByRoom
};