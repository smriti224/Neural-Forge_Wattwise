import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { getComparison, getRooms, getWasteOverview } from "../api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Analytics({ refreshKey }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("101");
  const [overview, setOverview] = useState({ total_saved: 0, total_wasted: 0, unit: "kWh" });
  const [comparison, setComparison] = useState({ before_kwh: 0, after_kwh: 0, reduction_percent: 0 });
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setError("");
    try {
      const roomData = await getRooms();
      setRooms(roomData);

      const roomToUse = roomData.some((room) => room.room_id === selectedRoom)
        ? selectedRoom
        : roomData[0]?.room_id || selectedRoom;

      if (roomToUse !== selectedRoom) setSelectedRoom(roomToUse);

      const [wasteOverview, comparisonData] = await Promise.all([
        getWasteOverview(),
        getComparison(roomToUse, "today")
      ]);

      setOverview(wasteOverview || { total_saved: 0, total_wasted: 0, unit: "kWh" });
      setComparison(comparisonData || { before_kwh: 0, after_kwh: 0, reduction_percent: 0 });
    } catch (err) {
      setError(err.message || "Unable to load analytics");
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedRoom, refreshKey]);

  const doughnutData = {
    labels: ["Wasted", "Saved"],
    datasets: [
      {
        data: [overview.total_wasted || 0, overview.total_saved || 0],
        backgroundColor: ["#E24B4A", "#1D9E75"],
        borderWidth: 0
      }
    ]
  };

  const beforeAfterData = {
    labels: [comparison.period || "today"],
    datasets: [
      {
        label: "Before WattWise",
        data: [comparison.before_kwh || 0],
        backgroundColor: "rgba(216, 90, 48, 0.18)",
        borderColor: "#D85A30",
        borderWidth: 1.5
      },
      {
        label: "After WattWise",
        data: [comparison.after_kwh || 0],
        backgroundColor: "rgba(29, 158, 117, 0.18)",
        borderColor: "#1D9E75",
        borderWidth: 1.5
      }
    ]
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h2 style={styles.title}>Analytics</h2>
        <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={styles.select}>
          {rooms.length === 0 ? <option value="101">Room 101</option> : rooms.map((room) => (
            <option key={room.room_id} value={room.room_id}>Room {room.room_id}</option>
          ))}
        </select>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.cardsGrid}>
        <Metric title="TOTAL SAVED TODAY" value={overview.total_saved || 0} sub="kWh" color="#1D9E75" />
        <Metric title="TOTAL WASTED TODAY" value={overview.total_wasted || 0} sub="kWh" color="#E24B4A" />
        <Metric title="BEFORE WATTWISE" value={comparison.before_kwh || 0} sub="kWh · live timetable" color="#BA7517" />
        <Metric title="AFTER WATTWISE" value={comparison.after_kwh || 0} sub={`kWh · ${comparison.reduction_percent || 0}% reduction`} color="#1D725B" />
      </div>

      <div style={styles.liveStatus}>
        <strong>Live timetable check:</strong>{" "}
        {comparison.is_class_live_now ? "Class is currently running" : "No class is currently scheduled"}
        {comparison.current_class ? ` · ${comparison.current_class.label} (${comparison.current_class.start_time}-${comparison.current_class.end_time})` : ""}
        {comparison.current_time ? ` · ${comparison.current_day} ${comparison.current_time}` : ""}
      </div>

      <div style={styles.graphGrid}>
        <div style={styles.graphCard}>
          <h3 style={styles.graphTitle}>WASTE VS SAVED TODAY</h3>
          <div style={styles.chartBox}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: { legend: { position: "bottom" } }
              }}
            />
          </div>
        </div>

        <div style={styles.graphCard}>
          <h3 style={styles.graphTitle}>BEFORE VS AFTER · ROOM {selectedRoom}</h3>
          <div style={styles.chartBox}>
            <Bar
              data={beforeAfterData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { position: "bottom" } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, sub, color }) {
  return (
    <div style={{ ...styles.metricCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricSub}>{sub}</div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", fontFamily: "Syne, sans-serif" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  title: { margin: 0, fontSize: "20px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #eee", background: "#fff" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  metricCard: { background: "#fff", borderRadius: "12px", padding: "22px", border: "1px solid #eee" },
  metricTitle: { color: "#888", fontSize: "11px", fontWeight: 800, letterSpacing: "1px", marginBottom: "16px" },
  metricValue: { fontSize: "32px", fontWeight: 900 },
  metricSub: { fontSize: "12px", color: "#777", marginTop: "4px" },
  liveStatus: { background: "#E8F0FB", color: "#234", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" },
  graphGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  graphCard: { background: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #eee", minHeight: "330px" },
  graphTitle: { margin: "0 0 20px", fontSize: "12px", color: "#888", letterSpacing: "1px" },
  chartBox: { height: "260px" },
  errorBox: { background: "#FDEBEC", color: "#7A1E25", padding: "10px", borderRadius: "8px", marginBottom: "12px" }
};

export default Analytics;
