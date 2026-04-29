import React, { useEffect, useState } from "react";
import {
    getRooms,
    getTimetable,
    postTimetable,
    uploadTimetableFile
} from "../api";

const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
];

function Timetable() {
    const [rooms, setRooms] = useState([{ room_id: "101", floor: "Floor 1" }]);
    const [selectedRoom, setSelectedRoom] = useState("101");
    const [selectedDay, setSelectedDay] = useState("monday");

    const [schedule, setSchedule] = useState([]);

    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [label, setLabel] = useState("Class");

    const [uploadFile, setUploadFile] = useState(null);
    const [uploadRoomId, setUploadRoomId] = useState("");
    const [uploadResult, setUploadResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadRooms = async () => {
        try {
            const data = await getRooms();

            if (Array.isArray(data) && data.length > 0) {
                setRooms(data);

                if (!selectedRoom) {
                    setSelectedRoom(data[0].room_id);
                }
            } else if (data?.rooms && data.rooms.length > 0) {
                setRooms(data.rooms);

                if (!selectedRoom) {
                    setSelectedRoom(data.rooms[0].room_id);
                }
            }
        } catch (err) {
            console.warn("Rooms API not available yet. Using default room 101.");
            setRooms([{ room_id: "101", floor: "Floor 1" }]);
        }
    };

    const loadTimetable = async () => {
        if (!selectedRoom) return;

        setLoading(true);
        setError("");

        try {
            const data = await getTimetable(selectedRoom);
            setSchedule(data.schedule || []);
        } catch (err) {
            setSchedule([]);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        loadTimetable();
    }, [selectedRoom]);

    const getSlotsForDay = (day) => {
        const daySchedule = schedule.find((item) => item.day === day);
        return daySchedule?.slots || [];
    };

    const handleAddSlot = async () => {
        setMessage("");
        setError("");

        if (!selectedRoom) {
            setError("Please select a room");
            return;
        }

        if (!startTime || !endTime || !label) {
            setError("Please fill start time, end time and label");
            return;
        }

        if (startTime >= endTime) {
            setError("End time must be greater than start time");
            return;
        }

        try {
            const existingSlots = getSlotsForDay(selectedDay);

            const updatedSlots = [
                ...existingSlots,
                {
                    start_time: startTime,
                    end_time: endTime,
                    label
                }
            ];

            await postTimetable({
                room_id: selectedRoom,
                day: selectedDay,
                slots: updatedSlots
            });

            setMessage("Timetable slot added successfully");
            setLabel("Class");

            await loadTimetable();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSlot = async (day, indexToDelete) => {
        setMessage("");
        setError("");

        try {
            const existingSlots = getSlotsForDay(day);

            const updatedSlots = existingSlots.filter(
                (_, index) => index !== indexToDelete
            );

            await postTimetable({
                room_id: selectedRoom,
                day,
                slots: updatedSlots
            });

            setMessage("Timetable slot deleted successfully");
            await loadTimetable();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUploadTimetable = async () => {
        setUploadResult(null);
        setMessage("");
        setError("");

        if (!uploadFile) {
            setError("Please select an image or PDF file");
            return;
        }

        setUploading(true);

        try {
            const roomIdToUse = uploadRoomId || selectedRoom;
            const result = await uploadTimetableFile(uploadFile, roomIdToUse);

            setUploadResult(result);

            if (result.saved) {
                setMessage(`Timetable uploaded successfully. Parsed ${result.parsed_count} rows.`);
                await loadTimetable();
            } else {
                setError(result.message || "Could not parse timetable from file");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const activeDaySlots = getSlotsForDay(selectedDay);

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <h2 style={styles.title}>Timetable</h2>

                <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    style={styles.select}
                >
                    {rooms.map((room) => (
                        <option key={room.room_id} value={room.room_id}>
                            Room {room.room_id}
                            {room.floor ? ` · ${room.floor}` : ""}
                        </option>
                    ))}
                </select>
            </div>

            {message && <div style={styles.successBox}>{message}</div>}
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.uploadCard}>
                <div style={styles.cardTitle}>UPLOAD TIMETABLE IMAGE / PDF</div>

                <div style={styles.uploadGrid}>
                    <input
                        type="text"
                        placeholder="Optional Room ID, e.g. 101"
                        value={uploadRoomId}
                        onChange={(e) => setUploadRoomId(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        style={styles.fileInput}
                    />

                    <button
                        onClick={handleUploadTimetable}
                        disabled={uploading}
                        style={styles.greenButton}
                    >
                        {uploading ? "Processing..." : "Upload"}
                    </button>
                </div>

                <div style={styles.helperText}>
                    Best format in image/PDF: Room 101 Monday 09:00-10:00 Maths
                </div>

                {uploadResult?.parsed_rows?.length > 0 && (
                    <div style={styles.previewBox}>
                        <div style={styles.previewTitle}>Parsed Timetable Preview</div>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Room</th>
                                    <th style={styles.th}>Day</th>
                                    <th style={styles.th}>Start</th>
                                    <th style={styles.th}>End</th>
                                    <th style={styles.th}>Label</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadResult.parsed_rows.map((row, index) => (
                                    <tr key={index}>
                                        <td style={styles.td}>{row.room_id}</td>
                                        <td style={styles.td}>{row.day}</td>
                                        <td style={styles.td}>{row.start_time}</td>
                                        <td style={styles.td}>{row.end_time}</td>
                                        <td style={styles.td}>{row.label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={styles.manualCard}>
                <div style={styles.cardTitle}>ADD TIMETABLE SLOT MANUALLY</div>

                <div style={styles.formGrid}>
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        style={styles.input}
                    >
                        {DAYS.map((day) => (
                            <option key={day} value={day}>
                                {capitalize(day)}
                            </option>
                        ))}
                    </select>

                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Subject / class name"
                        style={styles.input}
                    />

                    <button onClick={handleAddSlot} style={styles.greenButton}>
                        Add Slot
                    </button>
                </div>
            </div>

            <div style={styles.daysWrapper}>
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        style={{
                            ...styles.dayButton,
                            ...(selectedDay === day ? styles.activeDayButton : {})
                        }}
                    >
                        {day.slice(0, 3)}
                    </button>
                ))}
            </div>

            <div style={styles.scheduleCard}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>
                        ROOM {selectedRoom} · {capitalize(selectedDay)} Schedule
                    </div>

                    <div style={styles.smallText}>
                        {activeDaySlots.length} slot{activeDaySlots.length === 1 ? "" : "s"}
                    </div>
                </div>

                {loading ? (
                    <div style={styles.emptyText}>Loading timetable...</div>
                ) : activeDaySlots.length === 0 ? (
                    <div style={styles.emptyText}>No classes scheduled for this day</div>
                ) : (
                    <div style={styles.slotList}>
                        {activeDaySlots.map((slot, index) => (
                            <div key={index} style={styles.slotRow}>
                                <div style={styles.slotTime}>
                                    {slot.start_time} – {slot.end_time}
                                </div>

                                <div style={styles.slotLabel}>{slot.label}</div>

                                <button
                                    onClick={() => handleDeleteSlot(selectedDay, index)}
                                    style={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.scheduleCard}>
                <div style={styles.cardTitle}>FULL WEEK VIEW</div>

                {DAYS.map((day) => {
                    const slots = getSlotsForDay(day);

                    return (
                        <div key={day} style={styles.weekDayBlock}>
                            <div style={styles.weekDayTitle}>{capitalize(day)}</div>

                            {slots.length === 0 ? (
                                <div style={styles.weekEmpty}>No slots</div>
                            ) : (
                                slots.map((slot, index) => (
                                    <div key={index} style={styles.weekSlot}>
                                        <span style={styles.weekTime}>
                                            {slot.start_time} – {slot.end_time}
                                        </span>
                                        <span>{slot.label}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function capitalize(text = "") {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = {
    page: {
        padding: "24px",
        background: "#f7f7f7",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px"
    },
    title: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#111"
    },
    select: {
        padding: "9px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "white",
        fontSize: "13px"
    },
    uploadCard: {
        background: "white",
        borderRadius: "14px",
        padding: "18px",
        border: "1px solid #ececec",
        marginBottom: "18px"
    },
    manualCard: {
        background: "white",
        borderRadius: "14px",
        padding: "18px",
        border: "1px solid #ececec",
        marginBottom: "18px"
    },
    cardTitle: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#111",
        letterSpacing: "0.4px",
        marginBottom: "14px"
    },
    uploadGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: "10px",
        alignItems: "center"
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 2fr auto",
        gap: "10px",
        alignItems: "center"
    },
    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#fff",
        fontSize: "13px",
        outline: "none"
    },
    fileInput: {
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#fff",
        fontSize: "13px"
    },
    greenButton: {
        background: "#1D9E75",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "10px 16px",
        fontWeight: "700",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },
    helperText: {
        fontSize: "11px",
        color: "#888",
        marginTop: "10px"
    },
    successBox: {
        background: "#E1F5EE",
        color: "#085041",
        padding: "10px 12px",
        borderRadius: "8px",
        marginBottom: "14px",
        fontSize: "13px",
        fontWeight: "600"
    },
    errorBox: {
        background: "#FCEBEB",
        color: "#501313",
        padding: "10px 12px",
        borderRadius: "8px",
        marginBottom: "14px",
        fontSize: "13px",
        fontWeight: "600"
    },
    previewBox: {
        marginTop: "16px",
        overflowX: "auto"
    },
    previewTitle: {
        fontSize: "12px",
        fontWeight: "700",
        marginBottom: "8px"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px"
    },
    th: {
        textAlign: "left",
        padding: "8px",
        borderBottom: "1px solid #eee",
        color: "#777"
    },
    td: {
        padding: "8px",
        borderBottom: "1px solid #f2f2f2"
    },
    daysWrapper: {
        display: "flex",
        gap: "6px",
        marginBottom: "18px",
        background: "#ededed",
        padding: "6px",
        borderRadius: "10px"
    },
    dayButton: {
        flex: 1,
        border: "none",
        background: "transparent",
        padding: "8px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        color: "#777",
        textTransform: "capitalize"
    },
    activeDayButton: {
        background: "white",
        color: "#111"
    },
    scheduleCard: {
        background: "white",
        borderRadius: "14px",
        padding: "18px",
        border: "1px solid #ececec",
        marginBottom: "18px"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    smallText: {
        fontSize: "11px",
        color: "#888"
    },
    emptyText: {
        padding: "24px 0",
        textAlign: "center",
        color: "#888",
        fontSize: "13px"
    },
    slotList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    slotRow: {
        display: "grid",
        gridTemplateColumns: "150px 1fr auto",
        gap: "12px",
        alignItems: "center",
        padding: "12px",
        background: "#fafafa",
        borderRadius: "10px",
        border: "1px solid #f0f0f0"
    },
    slotTime: {
        fontSize: "12px",
        color: "#777",
        fontWeight: "700"
    },
    slotLabel: {
        fontSize: "14px",
        color: "#222",
        fontWeight: "600"
    },
    deleteButton: {
        background: "#FCEBEB",
        color: "#501313",
        border: "none",
        padding: "7px 10px",
        borderRadius: "7px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "11px"
    },
    weekDayBlock: {
        borderTop: "1px solid #f0f0f0",
        padding: "12px 0"
    },
    weekDayTitle: {
        fontSize: "13px",
        fontWeight: "700",
        marginBottom: "8px"
    },
    weekEmpty: {
        color: "#aaa",
        fontSize: "12px"
    },
    weekSlot: {
        display: "flex",
        gap: "12px",
        fontSize: "12px",
        padding: "4px 0"
    },
    weekTime: {
        color: "#777",
        fontWeight: "700",
        minWidth: "110px"
    }
};

export default Timetable;