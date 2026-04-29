import React, { useEffect, useState } from "react";
import {
    submitClassroomData,
    createRoom,
    deleteRoom,
    getRooms
} from "../api";

const MAX_OCCUPANCY = 60;
const DEVICE_STORAGE_KEY = "wattwise_room_device_states";

function getNowInputValue() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

function getStoredDeviceStates() {
    try {
        const saved = localStorage.getItem(DEVICE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

function saveStoredDeviceStates(states) {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(states));
}

function getDefaultDeviceState() {
    return {
        lights: false,
        fans: false,
        ac: false
    };
}

function ensureDeviceStateForRoom(roomId) {
    const states = getStoredDeviceStates();

    if (!states[roomId]) {
        states[roomId] = getDefaultDeviceState();
        saveStoredDeviceStates(states);
    }

    return states[roomId];
}

function updateDeviceStateForRoom(roomId, newDeviceState) {
    const states = getStoredDeviceStates();
    states[roomId] = newDeviceState;
    saveStoredDeviceStates(states);
}

function removeDeviceStateForRoom(roomId) {
    const states = getStoredDeviceStates();
    delete states[roomId];
    saveStoredDeviceStates(states);
}

function DataEntry({ onDataSaved }) {
    const [rooms, setRooms] = useState([]);

    const [roomId, setRoomId] = useState("101");
    const [floor, setFloor] = useState("Floor 1");
    const [occupancy, setOccupancy] = useState(0);
    const [timestamp, setTimestamp] = useState(getNowInputValue());

    const [devices, setDevices] = useState({
        lights: false,
        fans: false,
        ac: false
    });

    const [newRoomId, setNewRoomId] = useState("102");
    const [newFloor, setNewFloor] = useState("Floor 1");

    const [loading, setLoading] = useState(false);
    const [roomLoading, setRoomLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const normalizeRooms = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.rooms)) return data.rooms;
        return [];
    };

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            const roomList = normalizeRooms(data);

            if (roomList.length > 0) {
                setRooms(roomList);

                roomList.forEach((room) => {
                    ensureDeviceStateForRoom(room.room_id);
                });

                const currentRoomExists = roomList.some(
                    (room) => room.room_id === roomId
                );

                if (!currentRoomExists) {
                    const firstRoom = roomList[0];
                    setRoomId(firstRoom.room_id);
                    setFloor(firstRoom.floor || "Floor 1");
                    setOccupancy(firstRoom.occupancy || 0);
                    setDevices(ensureDeviceStateForRoom(firstRoom.room_id));
                } else {
                    setDevices(ensureDeviceStateForRoom(roomId));
                }

                return;
            }

            const fallbackRoom = {
                room_id: "101",
                floor: "Floor 1",
                capacity: MAX_OCCUPANCY,
                occupancy: 0,
                category: "moderate"
            };

            setRooms([fallbackRoom]);
            setRoomId("101");
            setFloor("Floor 1");
            setOccupancy(0);
            setDevices(ensureDeviceStateForRoom("101"));
        } catch (error) {
            const fallbackRoom = {
                room_id: "101",
                floor: "Floor 1",
                capacity: MAX_OCCUPANCY,
                occupancy: 0,
                category: "moderate"
            };

            setRooms([fallbackRoom]);
            setRoomId("101");
            setFloor("Floor 1");
            setOccupancy(0);
            setDevices(ensureDeviceStateForRoom("101"));
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const handleUseRoom = (room) => {
        const selectedRoomId = room.room_id;
        const selectedFloor = room.floor || "Floor 1";

        setRoomId(selectedRoomId);
        setFloor(selectedFloor);
        setOccupancy(room.occupancy || 0);
        setDevices(ensureDeviceStateForRoom(selectedRoomId));

        setSuccessMessage("");
        setErrorMessage("");
    };

    const toggleDevice = (deviceName) => {
        const updatedDevices = {
            ...devices,
            [deviceName]: !devices[deviceName]
        };

        setDevices(updatedDevices);
        updateDeviceStateForRoom(roomId, updatedDevices);
    };

    const handleAddRoom = async () => {
        setRoomLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        if (!newRoomId.trim()) {
            setErrorMessage("Please enter a room ID");
            setRoomLoading(false);
            return;
        }

        try {
            await createRoom({
                room_id: newRoomId.trim(),
                floor: newFloor.trim() || "Floor 1",
                capacity: MAX_OCCUPANCY
            });

            const defaultDevices = getDefaultDeviceState();

            const states = getStoredDeviceStates();
            states[newRoomId.trim()] = defaultDevices;
            saveStoredDeviceStates(states);

            setRoomId(newRoomId.trim());
            setFloor(newFloor.trim() || "Floor 1");
            setOccupancy(0);
            setDevices(defaultDevices);

            setSuccessMessage(
                `Room ${newRoomId.trim()} added. You can now manually choose Lights, Fans, and AC.`
            );

            await loadRooms();

            const nextRoomNumber = Number(newRoomId) + 1;
            if (!Number.isNaN(nextRoomNumber)) {
                setNewRoomId(String(nextRoomNumber));
            }
        } catch (error) {
            setErrorMessage(error.message || "Unable to add room");
        } finally {
            setRoomLoading(false);
        }
    };

    const handleDeleteRoom = async (id) => {
        setRoomLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            await deleteRoom(id);
            removeDeviceStateForRoom(id);

            setSuccessMessage(`Room ${id} deleted successfully`);
            await loadRooms();
        } catch (error) {
            setErrorMessage(error.message || "Unable to delete room");
        } finally {
            setRoomLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        const safeOccupancy = Math.max(
            0,
            Math.min(MAX_OCCUPANCY, Number(occupancy))
        );

        const payload = {
            room_id: roomId,
            floor,
            timestamp: new Date(timestamp).toISOString(),
            occupancy: safeOccupancy,
            max_occupancy: MAX_OCCUPANCY,
            devices: {
                lights: Boolean(devices.lights),
                fans: Boolean(devices.fans),
                ac: Boolean(devices.ac)
            }
        };

        try {
            updateDeviceStateForRoom(roomId, payload.devices);

            await submitClassroomData(payload);

            setSuccessMessage(
                `Room ${roomId} saved. Occupancy and device state were submitted independently.`
            );

            if (onDataSaved) {
                onDataSaved();
            }

            await loadRooms();
        } catch (error) {
            setErrorMessage(error.message || "Unable to submit classroom data");
        } finally {
            setLoading(false);
        }
    };

    const safeOccupancy = Math.max(0, Math.min(MAX_OCCUPANCY, Number(occupancy)));
    const occupancyPercent = Math.round((safeOccupancy / MAX_OCCUPANCY) * 100);

    return (
        <div style={styles.page}>
            <h2 style={styles.pageTitle}>Log Data</h2>

            {successMessage && <div style={styles.successBox}>{successMessage}</div>}
            {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.cardTitle}>CLASSROOM DATA</div>

                    <label style={styles.label}>ROOM ID</label>
                    <input
                        value={roomId}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRoomId(value);
                            setDevices(ensureDeviceStateForRoom(value));
                        }}
                        style={styles.input}
                    />

                    <label style={styles.label}>FLOOR</label>
                    <input
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        style={styles.input}
                    />

                    <label style={styles.label}>OCCUPANCY / 60</label>
                    <input
                        type="number"
                        min="0"
                        max={MAX_OCCUPANCY}
                        value={occupancy}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setOccupancy(Math.max(0, Math.min(MAX_OCCUPANCY, value)));
                        }}
                        style={styles.input}
                    />

                    <div style={styles.helperText}>
                        Maximum occupancy is fixed at 60 students. Current load:{" "}
                        {occupancyPercent}%
                    </div>

                    <label style={styles.label}>TIMESTAMP</label>
                    <input
                        type="datetime-local"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        style={styles.input}
                    />

                    <label style={styles.label}>MANUAL DEVICE STATE</label>

                    <div style={styles.deviceGrid}>
                        <DeviceButton
                            label="Lights"
                            active={devices.lights}
                            onClick={() => toggleDevice("lights")}
                        />

                        <DeviceButton
                            label="Fans"
                            active={devices.fans}
                            onClick={() => toggleDevice("fans")}
                        />

                        <DeviceButton
                            label="Ac"
                            active={devices.ac}
                            onClick={() => toggleDevice("ac")}
                        />
                    </div>

                    <div style={styles.helperText}>
                        Occupancy and devices are independent. You can set occupancy as 0
                        and still choose Lights/Fans/AC as ON if that is the actual room condition.
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        {loading ? "Submitting..." : "Submit Entry"}
                    </button>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>ADDED CLASSROOMS</div>
                    </div>

                    <div style={styles.addRoomRow}>
                        <input
                            value={newRoomId}
                            onChange={(e) => setNewRoomId(e.target.value)}
                            placeholder="Room ID"
                            style={styles.smallInput}
                        />

                        <input
                            value={newFloor}
                            onChange={(e) => setNewFloor(e.target.value)}
                            placeholder="Floor"
                            style={styles.smallInput}
                        />

                        <button
                            onClick={handleAddRoom}
                            disabled={roomLoading}
                            style={styles.addButton}
                        >
                            Add
                        </button>
                    </div>

                    <div style={styles.roomList}>
                        {rooms.length === 0 ? (
                            <div style={styles.emptyText}>No classrooms added yet</div>
                        ) : (
                            rooms.map((room) => {
                                const roomDevices = ensureDeviceStateForRoom(room.room_id);
                                const roomOccupancy = Number(room.occupancy || 0);

                                return (
                                    <div key={room.room_id} style={styles.roomCard}>
                                        <div>
                                            <div style={styles.roomTitle}>Room {room.room_id}</div>

                                            <div style={styles.roomMeta}>
                                                {room.floor || "Floor 1"} · Capacity{" "}
                                                {room.capacity || MAX_OCCUPANCY}
                                            </div>

                                            <div style={styles.roomMeta}>
                                                Occupancy {roomOccupancy}/{MAX_OCCUPANCY} ·{" "}
                                                {Math.round((roomOccupancy / MAX_OCCUPANCY) * 100)}%
                                            </div>

                                            <div style={styles.deviceSummary}>
                                                Lights {roomDevices.lights ? "ON" : "OFF"} · Fans{" "}
                                                {roomDevices.fans ? "ON" : "OFF"} · AC{" "}
                                                {roomDevices.ac ? "ON" : "OFF"}
                                            </div>
                                        </div>

                                        <div style={styles.roomActions}>
                                            <button
                                                onClick={() => handleUseRoom(room)}
                                                style={styles.useButton}
                                            >
                                                Use
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRoom(room.room_id)}
                                                style={styles.deleteButton}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div style={styles.selectedBox}>
                        Selected: Room {roomId} · {floor} · Occupancy {safeOccupancy}/
                        {MAX_OCCUPANCY} · Lights {devices.lights ? "ON" : "OFF"} · Fans{" "}
                        {devices.fans ? "ON" : "OFF"} · AC {devices.ac ? "ON" : "OFF"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeviceButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                ...styles.deviceButton,
                background: active ? "#E1F5EE" : "#F2F2F2",
                border: active ? "1px solid #1D9E75" : "1px solid #eee",
                color: active ? "#085041" : "#777"
            }}
        >
            {label} {active ? "ON" : "OFF"}
        </button>
    );
}

const styles = {
    page: {
        padding: "24px",
        background: "#f7f7f7",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    pageTitle: {
        margin: "0 0 22px",
        fontSize: "18px",
        fontWeight: "700",
        color: "#111"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "26px"
    },
    card: {
        background: "white",
        borderRadius: "14px",
        padding: "20px",
        border: "1px solid #ececec"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    cardTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#111",
        letterSpacing: "0.4px",
        marginBottom: "16px"
    },
    label: {
        display: "block",
        fontSize: "11px",
        fontWeight: "700",
        color: "#999",
        marginTop: "14px",
        marginBottom: "8px"
    },
    input: {
        width: "100%",
        height: "40px",
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "0 12px",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box"
    },
    helperText: {
        marginTop: "8px",
        fontSize: "12px",
        color: "#777"
    },
    deviceGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px"
    },
    deviceButton: {
        height: "40px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "13px",
        cursor: "pointer"
    },
    submitButton: {
        width: "100%",
        height: "44px",
        border: "none",
        borderRadius: "8px",
        background: "#1D9E75",
        color: "white",
        fontWeight: "700",
        cursor: "pointer",
        marginTop: "24px"
    },
    addRoomRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: "10px",
        marginBottom: "16px"
    },
    smallInput: {
        height: "38px",
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "0 12px",
        outline: "none"
    },
    addButton: {
        height: "38px",
        border: "none",
        borderRadius: "8px",
        background: "#1D9E75",
        color: "white",
        padding: "0 16px",
        fontWeight: "700",
        cursor: "pointer"
    },
    roomList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    roomCard: {
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    roomTitle: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#111"
    },
    roomMeta: {
        fontSize: "12px",
        color: "#777",
        marginTop: "3px"
    },
    deviceSummary: {
        fontSize: "12px",
        color: "#085041",
        marginTop: "6px",
        fontWeight: "700"
    },
    roomActions: {
        display: "flex",
        gap: "8px"
    },
    useButton: {
        border: "none",
        borderRadius: "8px",
        background: "#E1F5EE",
        color: "#085041",
        padding: "8px 12px",
        fontWeight: "700",
        cursor: "pointer"
    },
    deleteButton: {
        border: "none",
        borderRadius: "8px",
        background: "#FCEBEB",
        color: "#8A1C1C",
        padding: "8px 12px",
        fontWeight: "700",
        cursor: "pointer"
    },
    selectedBox: {
        marginTop: "16px",
        background: "#E8F0FE",
        color: "#17324D",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "700"
    },
    successBox: {
        background: "#E1F5EE",
        color: "#085041",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "14px",
        fontWeight: "700"
    },
    errorBox: {
        background: "#FCEBEB",
        color: "#501313",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "14px",
        fontWeight: "700"
    },
    emptyText: {
        color: "#999",
        fontSize: "13px",
        padding: "20px 0"
    }
};

export default DataEntry;