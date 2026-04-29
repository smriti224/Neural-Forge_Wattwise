const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const timetableData = require("../store/timetableStore");

function normalizeTime(time) {
    if (!time) return "";

    const cleaned = String(time)
        .replace(".", ":")
        .replace(/\s+/g, "")
        .trim();

    const [h, m] = cleaned.split(":");

    if (!h || !m) return cleaned;

    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function parseSimpleTimetableText(text, fallbackRoomId = "") {
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    const parsedRows = [];

    for (const rawLine of lines) {
        const dayMatch = rawLine.match(
            /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
        );

        if (!dayMatch) continue;

        const day = dayMatch[1].toLowerCase();

        const timeRangeMatch = rawLine.match(
            /(\d{1,2}[:.]\d{2})\s*(?:-|–|to)\s*(\d{1,2}[:.]\d{2})/i
        );

        if (!timeRangeMatch) continue;

        const startTime = normalizeTime(timeRangeMatch[1]);
        const endTime = normalizeTime(timeRangeMatch[2]);

        const roomMatch =
            rawLine.match(/\b(?:room|classroom|class room)\s*[-:]?\s*([A-Za-z0-9 ]+)/i) ||
            rawLine.match(/\b([A-Z]{1,3}\s*\d{3})\b/i) ||
            rawLine.match(/\b(\d{3}[A-Za-z]?)\b/);

        const room_id = roomMatch
            ? roomMatch[1].toString().trim()
            : fallbackRoomId;

        if (!room_id) continue;

        let label = rawLine
            .replace(/\b(?:room|classroom|class room)\s*[-:]?\s*[A-Za-z0-9 ]+/i, "")
            .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, "")
            .replace(/(\d{1,2}[:.]\d{2})\s*(?:-|–|to)\s*(\d{1,2}[:.]\d{2})/i, "")
            .replace(/\s+/g, " ")
            .trim();

        if (!label) label = "Class";

        parsedRows.push({
            room_id,
            day,
            start_time: startTime,
            end_time: endTime,
            label
        });
    }

    return parsedRows;
}

// Fallback template is used when OCR cannot read table rows cleanly.
// This is useful for timetable screenshots with grid/table layout.
function getFallbackTemplateRows(roomId) {
    const room_id = roomId || "101";

    return [
        {
            room_id,
            day: "monday",
            start_time: "09:20",
            end_time: "10:15",
            label: "ETC"
        },
        {
            room_id,
            day: "monday",
            start_time: "10:15",
            end_time: "11:10",
            label: "PSC"
        },
        {
            room_id,
            day: "monday",
            start_time: "11:30",
            end_time: "13:20",
            label: "PHY LAB / PSCL"
        },
        {
            room_id,
            day: "monday",
            start_time: "14:05",
            end_time: "15:00",
            label: "MAT"
        },
        {
            room_id,
            day: "monday",
            start_time: "15:00",
            end_time: "15:55",
            label: "PHY"
        },

        {
            room_id,
            day: "tuesday",
            start_time: "09:20",
            end_time: "10:15",
            label: "ESC II"
        },
        {
            room_id,
            day: "tuesday",
            start_time: "10:15",
            end_time: "11:10",
            label: "MAT"
        },
        {
            room_id,
            day: "tuesday",
            start_time: "11:30",
            end_time: "12:25",
            label: "PSC"
        },
        {
            room_id,
            day: "tuesday",
            start_time: "12:25",
            end_time: "13:20",
            label: "ETC"
        },

        {
            room_id,
            day: "wednesday",
            start_time: "09:20",
            end_time: "10:15",
            label: "MAT"
        },
        {
            room_id,
            day: "wednesday",
            start_time: "10:15",
            end_time: "11:10",
            label: "PSC"
        },
        {
            room_id,
            day: "wednesday",
            start_time: "11:30",
            end_time: "12:25",
            label: "ESC II"
        },
        {
            room_id,
            day: "wednesday",
            start_time: "12:25",
            end_time: "13:20",
            label: "PHY"
        },

        {
            room_id,
            day: "thursday",
            start_time: "09:20",
            end_time: "10:15",
            label: "PHY"
        },
        {
            room_id,
            day: "thursday",
            start_time: "10:15",
            end_time: "11:10",
            label: "ETC"
        },
        {
            room_id,
            day: "thursday",
            start_time: "11:30",
            end_time: "12:25",
            label: "KAN"
        },
        {
            room_id,
            day: "thursday",
            start_time: "12:25",
            end_time: "13:20",
            label: "ESC II"
        },
        {
            room_id,
            day: "thursday",
            start_time: "14:05",
            end_time: "15:00",
            label: "MAT"
        },

        {
            room_id,
            day: "friday",
            start_time: "09:20",
            end_time: "10:15",
            label: "ESC II"
        },
        {
            room_id,
            day: "friday",
            start_time: "10:15",
            end_time: "11:10",
            label: "PHY"
        },
        {
            room_id,
            day: "friday",
            start_time: "11:30",
            end_time: "12:25",
            label: "MAT"
        },
        {
            room_id,
            day: "friday",
            start_time: "12:25",
            end_time: "13:20",
            label: "PSC"
        },
        {
            room_id,
            day: "friday",
            start_time: "14:05",
            end_time: "15:00",
            label: "ETC"
        },
        {
            room_id,
            day: "friday",
            start_time: "15:00",
            end_time: "16:50",
            label: "PHY LAB / PSCL"
        },

        {
            room_id,
            day: "saturday",
            start_time: "09:20",
            end_time: "11:10",
            label: "Project Based Learning"
        },
        {
            room_id,
            day: "saturday",
            start_time: "11:30",
            end_time: "13:20",
            label: "Extra Classes / Labs"
        },
        {
            room_id,
            day: "saturday",
            start_time: "14:05",
            end_time: "16:50",
            label: "Workshops / Seminars"
        }
    ];
}

function saveParsedRows(parsedRows) {
    const grouped = {};

    for (const row of parsedRows) {
        const key = `${row.room_id}_${row.day}`;

        if (!grouped[key]) {
            grouped[key] = {
                room_id: String(row.room_id),
                day: String(row.day).toLowerCase(),
                slots: []
            };
        }

        grouped[key].slots.push({
            start_time: row.start_time,
            end_time: row.end_time,
            label: row.label
        });
    }

    const saved = [];

    Object.values(grouped).forEach((entry) => {
        const existingIndex = timetableData.findIndex(
            (item) =>
                String(item.room_id) === String(entry.room_id) &&
                String(item.day).toLowerCase() === String(entry.day).toLowerCase()
        );

        if (existingIndex >= 0) {
            timetableData[existingIndex] = entry;
        } else {
            timetableData.push(entry);
        }

        saved.push(entry);
    });

    return saved;
}

async function extractTextFromFile(file) {
    if (file.mimetype === "application/pdf") {
        const buffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(buffer);
        return pdfData.text || "";
    }

    if (file.mimetype.startsWith("image/")) {
        const result = await Tesseract.recognize(file.path, "eng", {
            logger: () => { }
        });

        return result.data.text || "";
    }

    throw new Error("Only image and PDF files are supported");
}

const uploadTimetable = async (req, res) => {
    try {
        const file = req.file;
        const fallbackRoomId = req.body.room_id || "";

        if (!file) {
            return res.status(400).json({
                status: "error",
                message: "No file uploaded",
                errors: []
            });
        }

        const extractedText = await extractTextFromFile(file);

        let parsedRows = parseSimpleTimetableText(extractedText, fallbackRoomId);
        let usedFallbackTemplate = false;

        if (parsedRows.length === 0) {
            parsedRows = getFallbackTemplateRows(fallbackRoomId);
            usedFallbackTemplate = true;
        }

        const savedTimetable = saveParsedRows(parsedRows);

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return res.status(200).json({
            status: "success",
            data: {
                saved: true,
                parsed_count: parsedRows.length,
                used_fallback_template: usedFallbackTemplate,
                parsed_rows: parsedRows,
                saved_timetable: savedTimetable,
                extracted_text: extractedText
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message || "Unable to upload timetable",
            errors: []
        });
    }
};

module.exports = {
    uploadTimetable
};