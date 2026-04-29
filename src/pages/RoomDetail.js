import React, { useEffect, useState } from "react";
import { deleteRoom, getRooms } from "../api";

const scoreColor = (score) => {
  if (score === null || score === undefined) return "#999";
  if (score >= 80) return "#1D9E75";
  if (score >= 50) return "#BA7517";
  return "#E24B4A";
};

function RoomDetail({ refreshKey }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || "Unable to load rooms from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [refreshKey]);

  const removeRoom = async (roomId) => {
    try {
      await deleteRoom(roomId);
      await loadRooms();
    } catch (err) {
      setError(err.message || "Unable to delete room");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.header}>ALL ROOMS</h2>
        <button onClick={loadRooms} style={styles.refreshButton}>Refresh</button>
      </div>

      {loading && <div style={styles.infoBox}>Loading rooms from API...</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && rooms.length === 0 ? (
        <div style={styles.emptyState}>No data found. Add rooms from Log Data.</div>
      ) : (
        <div style={styles.roomList}>
          {rooms.map((room) => {
            const score = room.efficiency_score ?? 0;
            return (
              <div key={room.room_id} style={styles.roomRow}>
                <div style={styles.roomInfo}>
                  <span style={styles.roomLabel}>Room {room.room_id}</span>
                  <span style={styles.floorLabel}>{room.floor || "Floor 1"}</span>
                  <span style={styles.capacityLabel}>{room.occupancy || 0}/60 students · {room.occupancy_percentage || 0}%</span>
                  <span style={styles.scheduleLabel}>{room.schedule_status === "active" ? "Class live now" : "No class now"}</span>
                </div>

                <div style={styles.progressBg}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${score}%`,
                      background: scoreColor(score)
                    }}
                  />
                </div>

                <span style={{ ...styles.score, color: scoreColor(score) }}>
                  {room.efficiency_score ?? "--"}
                </span>

                <span
                  style={{
                    ...styles.categoryBadge,
                    background: room.category === "optimal" ? "#E1F5EE" : room.category === "moderate" ? "#FEF3E2" : "#FDEBEC",
                    color: room.category === "optimal" ? "#085041" : room.category === "moderate" ? "#BA7517" : "#E24B4A"
                  }}
                >
                  {room.category}
                </span>

                <button onClick={() => removeRoom(room.room_id)} style={styles.deleteButton}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px", fontFamily: "Syne, sans-serif" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  header: { fontSize: "14px", fontWeight: 800, margin: 0, letterSpacing: "0.4px" },
  refreshButton: { background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: 700 },
  roomList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" },
  roomRow: { display: "flex", alignItems: "center", gap: "18px", background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px" },
  roomInfo: { width: "230px", display: "flex", flexDirection: "column", gap: "3px" },
  roomLabel: { fontWeight: 800, fontSize: "14px" },
  floorLabel: { color: "#777", fontSize: "12px" },
  capacityLabel: { color: "#888", fontSize: "11px" },
  scheduleLabel: { color: "#1D9E75", fontSize: "11px", fontWeight: 700 },
  progressBg: { flex: 1, height: "8px", background: "#eee", borderRadius: "4px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  score: { fontWeight: 800, width: "44px", textAlign: "right" },
  categoryBadge: { fontSize: "11px", fontWeight: 800, borderRadius: "6px", padding: "4px 10px", textTransform: "capitalize", minWidth: "80px", textAlign: "center" },
  deleteButton: { border: "none", background: "#FDEBEC", color: "#7A1E25", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontWeight: 800 },
  emptyState: { color: "#777", fontStyle: "italic" },
  infoBox: { background: "#E8F0FB", color: "#234", padding: "10px", borderRadius: "8px", marginBottom: "12px" },
  errorBox: { background: "#FDEBEC", color: "#7A1E25", padding: "10px", borderRadius: "8px", marginBottom: "12px" }
};

export default RoomDetail;
