import React, { useEffect, useState } from "react";
import {
    getLiveAnalysis,
    getWaste,
    getEfficiency,
    getRecommendations,
    getWasteOverview,
    getEfficiencyOverview,
    getRooms
} from "../api";

import LogoutButton from "../components/LogoutButton";

function Dashboard({ refreshKey }) {
    const [selectedRoom, setSelectedRoom] = useState("101");
    const [rooms, setRooms] = useState([{ room_id: "101", floor: "Floor 1" }]);

    const [analysis, setAnalysis] = useState(null);
    const [wasteFlags, setWasteFlags] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const [efficiency, setEfficiency] = useState({
        room_id: "101",
        efficiency_score: 0,
        category: "no data"
    });

    const [overview, setOverview] = useState({
        total_saved: 0,
        total_wasted: 0,
        unit: "kWh"
    });

    const [worstRoom, setWorstRoom] = useState("N/A");
    const [error, setError] = useState("");

    const getRoomId = (room) => {
        if (typeof room === "string") return room;
        return room.room_id || room.id || "101";
    };

    const getRoomLabel = (room) => {
        if (typeof room === "string") return `Room ${room}`;

        const roomId = room.room_id || room.id || "101";
        const floor = room.floor || room.floor_name || "";

        return floor ? `Room ${roomId} · ${floor}` : `Room ${roomId}`;
    };

    const loadRooms = async () => {
        try {
            const data = await getRooms();

            if (Array.isArray(data) && data.length > 0) {
                setRooms(data);
                return;
            }

            if (Array.isArray(data?.rooms) && data.rooms.length > 0) {
                setRooms(data.rooms);
                return;
            }
        } catch (err) {
            console.warn("Rooms API not available. Using fallback rooms.");
        }

        try {
            const efficiencyRooms = await getEfficiencyOverview();

            if (Array.isArray(efficiencyRooms) && efficiencyRooms.length > 0) {
                const convertedRooms = efficiencyRooms.map((room) => ({
                    room_id: room.room_id
                }));

                setRooms(convertedRooms);
            }
        } catch (err) {
            console.warn("Efficiency rooms fallback failed.");
        }
    };

    const loadDashboardData = async () => {
        setError("");

        try {
            const overviewResult = await getWasteOverview();
            setOverview(
                overviewResult || {
                    total_saved: 0,
                    total_wasted: 0,
                    unit: "kWh"
                }
            );
        } catch (err) {
            console.warn("Waste overview failed:", err.message);
        }

        try {
            const efficiencyOverview = await getEfficiencyOverview();

            if (Array.isArray(efficiencyOverview) && efficiencyOverview.length > 0) {
                const lowest = efficiencyOverview.reduce((worst, current) =>
                    Number(current.efficiency_score) < Number(worst.efficiency_score)
                        ? current
                        : worst
                );

                setWorstRoom(lowest.room_id || "N/A");
            }
        } catch (err) {
            console.warn("Efficiency overview failed:", err.message);
        }

        try {
            const liveData = await getLiveAnalysis(selectedRoom);
            setAnalysis(liveData);
        } catch (err) {
            setAnalysis(null);
            setError(err.message || `No data found for room ${selectedRoom}`);
        }

        try {
            const efficiencyData = await getEfficiency(selectedRoom);
            setEfficiency(
                efficiencyData || {
                    room_id: selectedRoom,
                    efficiency_score: 0,
                    category: "no data"
                }
            );
        } catch (err) {
            setEfficiency({
                room_id: selectedRoom,
                efficiency_score: 0,
                category: "no data"
            });
        }

        try {
            const wasteData = await getWaste(selectedRoom);
            setWasteFlags(wasteData?.waste_flags || []);
        } catch (err) {
            setWasteFlags([]);
        }

        try {
            const recommendationData = await getRecommendations(selectedRoom);
            setRecommendations(recommendationData?.recommendations || []);
        } catch (err) {
            setRecommendations([]);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [selectedRoom, refreshKey]);

    const actualDevices = analysis?.actual_device_state || {
        lights: false,
        fans: false,
        ac: false
    };

    const occupancy = analysis?.occupancy ?? 0;
    const maxOccupancy = analysis?.max_occupancy ?? 60;
    const occupancyPercentage =
        analysis?.occupancy_percentage ?? Math.round((occupancy / maxOccupancy) * 100);

    const isEmpty = analysis?.is_empty ?? false;
    const isDaytime = analysis?.is_daytime ?? true;
    const scheduleStatus = analysis?.schedule_status || "inactive";

    const efficiencyScore = efficiency?.efficiency_score ?? 0;
    const efficiencyCategory = efficiency?.category || "no data";

    const savedKwh = Number(overview?.total_saved || 0);
    const wastedKwh = Number(overview?.total_wasted || 0);
    const savedCost = Math.round(savedKwh * 8);
    const hourlySaving = Math.round(savedKwh * 8);

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <h2 style={styles.pageTitle}>Overview</h2>

                <div style={styles.topRightControls}>
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        style={styles.roomSelect}
                    >
                        {rooms.map((room) => {
                            const roomId = getRoomId(room);

                            return (
                                <option key={roomId} value={roomId}>
                                    {getRoomLabel(room)}
                                </option>
                            );
                        })}
                    </select>

                    <LogoutButton />
                </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.metricsGrid}>
                <MetricCard
                    title="SAVED TODAY"
                    value={savedKwh}
                    unit="kWh"
                    subtitle={`₹${savedCost}`}
                    color="#1D9E75"
                />

                <MetricCard
                    title="WASTED TODAY"
                    value={wastedKwh}
                    unit=""
                    subtitle={`${overview?.unit || "kWh"} campus-wide`}
                    color="#BA7517"
                />

                <MetricCard
                    title="WORST ROOM"
                    value={`#${worstRoom}`}
                    unit=""
                    subtitle="needs attention"
                    color="#E24B4A"
                />

                <MetricCard
                    title="HOURLY SAVING"
                    value={`₹${hourlySaving}`}
                    unit=""
                    subtitle={`${savedKwh} kWh/hr`}
                    color="#378ADD"
                />
            </div>

            <div style={styles.middleGrid}>
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <span style={styles.panelTitle}>ROOM {selectedRoom} · LIVE DEVICES</span>
                        <span style={styles.liveBadge}>Live</span>
                    </div>

                    <DeviceRow label="Lights" active={actualDevices.lights} />
                    <DeviceRow label="Fans" active={actualDevices.fans} />
                    <DeviceRow label="Ac" active={actualDevices.ac} />

                    <div style={styles.tagsRow}>
                        <span style={styles.tag}>{isEmpty ? "Empty" : "Occupied"}</span>
                        <span style={styles.tag}>{isDaytime ? "Daytime" : "Night"}</span>
                        <span style={styles.tag}>
                            {scheduleStatus === "active" ? "Class Going On" : "No Class Now"}
                        </span>
                        <span style={styles.tag}>
                            {occupancy}/{maxOccupancy} Students
                        </span>
                        <span style={styles.tag}>{occupancyPercentage}% Capacity</span>
                    </div>
                </div>

                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <span style={styles.panelTitle}>EFFICIENCY · ROOM {selectedRoom}</span>
                        <span
                            style={{
                                ...styles.statusBadge,
                                ...getCategoryBadgeStyle(efficiencyCategory)
                            }}
                        >
                            {efficiencyCategory}
                        </span>
                    </div>

                    <div style={styles.efficiencySection}>
                        <div
                            style={{
                                ...styles.scoreCircle,
                                borderColor: getScoreColor(efficiencyScore)
                            }}
                        >
                            {efficiencyScore}
                        </div>

                        <div>
                            <div style={styles.efficiencyLabel}>
                                {capitalize(efficiencyCategory)}
                            </div>
                            <div style={styles.efficiencySub}>Live score from backend</div>
                            <div style={styles.efficiencySub}>
                                Capacity baseline: {maxOccupancy} students
                            </div>
                        </div>
                    </div>

                    <div style={styles.recommendSection}>
                        <div style={styles.recommendTitle}>RECOMMENDATIONS</div>

                        {recommendations.length === 0 ? (
                            <div style={styles.emptySmallText}>No recommendations available</div>
                        ) : (
                            recommendations.map((rec, index) => (
                                <div key={index} style={styles.recommendRow}>
                                    <span style={styles.recommendAction}>
                                        {formatAction(rec.action)}
                                    </span>
                                    <span style={styles.recommendReason}>{rec.reason}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div style={styles.bottomPanel}>
                <div style={styles.panelHeader}>
                    <span style={styles.panelTitle}>WASTE FLAGS</span>
                    <span style={styles.smallRightText}>{wasteFlags.length} active</span>
                </div>

                <div style={styles.flagsWrap}>
                    {wasteFlags.length === 0 ? (
                        <div style={styles.emptySmallText}>No active waste flags</div>
                    ) : (
                        wasteFlags.map((flag, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.flagBox,
                                    backgroundColor: getFlagBackground(flag.type)
                                }}
                            >
                                <span style={styles.flagType}>{flag.type}</span>
                                <span style={styles.flagMessage}>{flag.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, unit, subtitle, color }) {
    return (
        <div style={{ ...styles.metricCard, borderLeft: `3px solid ${color}` }}>
            <div style={styles.metricTitle}>{title}</div>

            <div style={styles.metricValueRow}>
                <span style={styles.metricValue}>{value}</span>
                {unit && <span style={styles.metricUnit}>{unit}</span>}
            </div>

            <div style={styles.metricSubtitle}>{subtitle}</div>
        </div>
    );
}

function DeviceRow({ label, active }) {
    return (
        <div style={styles.deviceRow}>
            <span style={styles.deviceLabel}>{label}</span>

            <div
                style={{
                    ...styles.toggle,
                    backgroundColor: active ? "#1D9E75" : "#E5E5E5"
                }}
            >
                <div
                    style={{
                        ...styles.toggleKnob,
                        left: active ? "18px" : "2px"
                    }}
                />
            </div>
        </div>
    );
}

function getScoreColor(score) {
    if (score >= 80) return "#1D9E75";
    if (score >= 50) return "#B7791F";
    return "#E24B4A";
}

function getCategoryBadgeStyle(category = "") {
    if (category === "optimal") {
        return {
            background: "#E1F5EE",
            color: "#1D9E75"
        };
    }

    if (category === "moderate") {
        return {
            background: "#F9F0DF",
            color: "#B7791F"
        };
    }

    return {
        background: "#FCEBEB",
        color: "#E24B4A"
    };
}

function getFlagBackground(type) {
    if (type === "CRITICAL") return "#FDEBEC";
    if (type === "WARNING") return "#F9F1DF";
    return "#E8F0FB";
}

function capitalize(text = "") {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatAction(action = "") {
    return action.replaceAll("_", " ");
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
        marginBottom: "20px"
    },
    pageTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#111"
    },
    topRightControls: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    roomSelect: {
        height: "40px",
        minWidth: "180px",
        padding: "0 14px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        background: "#fff",
        fontSize: "14px",
        color: "#333",
        outline: "none"
    },
    errorBox: {
        background: "#FCEBEB",
        color: "#501313",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "16px",
        fontSize: "14px"
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "18px"
    },
    metricCard: {
        background: "#fff",
        borderRadius: "12px",
        padding: "18px",
        minHeight: "86px",
        border: "1px solid #ececec"
    },
    metricTitle: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#888",
        marginBottom: "10px"
    },
    metricValueRow: {
        display: "flex",
        alignItems: "baseline",
        gap: "6px"
    },
    metricValue: {
        fontSize: "26px",
        fontWeight: "700",
        color: "#111"
    },
    metricUnit: {
        fontSize: "12px",
        color: "#888"
    },
    metricSubtitle: {
        fontSize: "12px",
        color: "#999",
        marginTop: "4px"
    },
    middleGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
        marginBottom: "18px"
    },
    panel: {
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #ececec",
        padding: "20px",
        minHeight: "215px"
    },
    bottomPanel: {
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #ececec",
        padding: "20px"
    },
    panelHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px"
    },
    panelTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#111",
        letterSpacing: "0.3px"
    },
    liveBadge: {
        fontSize: "11px",
        padding: "4px 10px",
        background: "#E5F6EE",
        color: "#1D9E75",
        borderRadius: "6px",
        fontWeight: "700"
    },
    deviceRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px"
    },
    deviceLabel: {
        fontSize: "17px",
        color: "#222"
    },
    toggle: {
        width: "38px",
        height: "22px",
        borderRadius: "999px",
        position: "relative",
        transition: "0.2s"
    },
    toggleKnob: {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: "2px",
        transition: "0.2s"
    },
    tagsRow: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "18px"
    },
    tag: {
        fontSize: "12px",
        color: "#777",
        background: "#F1F1F1",
        padding: "6px 10px",
        borderRadius: "6px"
    },
    statusBadge: {
        fontSize: "11px",
        padding: "5px 10px",
        borderRadius: "7px",
        fontWeight: "700",
        textTransform: "lowercase"
    },
    efficiencySection: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
        marginBottom: "20px"
    },
    scoreCircle: {
        width: "76px",
        height: "76px",
        borderRadius: "50%",
        border: "4px solid #B7791F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        fontWeight: "700",
        color: "#111"
    },
    efficiencyLabel: {
        fontSize: "21px",
        fontWeight: "700",
        color: "#111",
        marginBottom: "6px"
    },
    efficiencySub: {
        fontSize: "14px",
        color: "#888",
        lineHeight: "1.4"
    },
    recommendSection: {
        marginTop: "8px"
    },
    recommendTitle: {
        fontSize: "13px",
        fontWeight: "700",
        marginBottom: "12px",
        color: "#111"
    },
    recommendRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px"
    },
    recommendAction: {
        fontSize: "11px",
        fontWeight: "700",
        padding: "5px 8px",
        border: "1px solid #E6E6E6",
        borderRadius: "6px",
        background: "#FAFAFA",
        whiteSpace: "nowrap"
    },
    recommendReason: {
        fontSize: "14px",
        color: "#555"
    },
    smallRightText: {
        fontSize: "12px",
        color: "#999"
    },
    flagsWrap: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    flagBox: {
        padding: "15px 18px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    flagType: {
        fontWeight: "700",
        color: "#111",
        minWidth: "85px",
        fontSize: "14px"
    },
    flagMessage: {
        fontSize: "14px",
        color: "#4A4A4A"
    },
    emptySmallText: {
        fontSize: "13px",
        color: "#999"
    }
};

export default Dashboard;