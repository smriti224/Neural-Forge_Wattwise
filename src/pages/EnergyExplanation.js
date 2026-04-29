import React, { useMemo, useState } from "react";

const usageRank = {
    Low: 1,
    Moderate: 2,
    High: 3
};

const mockSlots = [
    {
        time: "09:00 AM - 10:00 AM",
        eventType: "Lecture",
        expectedOccupancy: 55,
        actualOccupancy: 52,
        fanUsage: "High"
    },
    {
        time: "10:00 AM - 11:00 AM",
        eventType: "Lecture",
        expectedOccupancy: 45,
        actualOccupancy: 18,
        fanUsage: "High"
    },
    {
        time: "11:00 AM - 12:00 PM",
        eventType: "Lab",
        expectedOccupancy: 35,
        actualOccupancy: 34,
        fanUsage: "Moderate"
    },
    {
        time: "12:00 PM - 01:00 PM",
        eventType: "Break",
        expectedOccupancy: 8,
        actualOccupancy: 6,
        fanUsage: "Moderate"
    },
    {
        time: "01:00 PM - 02:00 PM",
        eventType: "Lunch",
        expectedOccupancy: 5,
        actualOccupancy: 3,
        fanUsage: "Low"
    },
    {
        time: "02:00 PM - 03:00 PM",
        eventType: "Lecture",
        expectedOccupancy: 48,
        actualOccupancy: 44,
        fanUsage: "Moderate"
    },
    {
        time: "03:00 PM - 04:00 PM",
        eventType: "Lab",
        expectedOccupancy: 42,
        actualOccupancy: 46,
        fanUsage: "High"
    },
    {
        time: "04:00 PM - 05:00 PM",
        eventType: "Lecture",
        expectedOccupancy: 22,
        actualOccupancy: 12,
        fanUsage: "Low"
    }
];

function getExpectedFanUsage(occupancy) {
    if (occupancy > 40) return "High";
    if (occupancy >= 15 && occupancy <= 40) return "Moderate";
    return "Low";
}

function getStatus(actualUsage, expectedUsage) {
    if (actualUsage === expectedUsage) return "Optimal";

    if (usageRank[actualUsage] > usageRank[expectedUsage]) {
        return "Inefficient";
    }

    return "Underperformance";
}

function getExplanation(slot, actualUsage, expectedUsage, status) {
    const occupancy = slot.actualOccupancy;

    if (status === "Optimal") {
        if (expectedUsage === "High") {
            return "High usage justified due to full occupancy.";
        }

        if (expectedUsage === "Moderate") {
            return "Moderate fan usage is suitable for the current occupancy.";
        }

        return "Low fan usage is appropriate because occupancy is low.";
    }

    if (status === "Inefficient") {
        return `Fan usage is higher than required for ${occupancy} students.`;
    }

    return `Cooling may be insufficient for ${occupancy} students.`;
}

function enrichSlot(slot, mode) {
    const expectedUsage = getExpectedFanUsage(slot.actualOccupancy);

    const actualUsage =
        mode === "optimized" ? expectedUsage : slot.fanUsage;

    const status = getStatus(actualUsage, expectedUsage);

    const explanation =
        mode === "optimized"
            ? "Optimized mode adjusts fan usage to the expected level for this occupancy."
            : getExplanation(slot, actualUsage, expectedUsage, status);

    return {
        ...slot,
        displayedFanUsage: actualUsage,
        expectedUsage,
        status,
        explanation
    };
}

function EnergyExplanation() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState("actual");

    const processedSlots = useMemo(() => {
        return mockSlots.map((slot) => enrichSlot(slot, mode));
    }, [mode]);

    const selectedSlot = processedSlots[selectedIndex];

    const totalSlots = processedSlots.length;
    const inefficientSlots = processedSlots.filter(
        (slot) => slot.status === "Inefficient"
    ).length;
    const optimalSlots = processedSlots.filter(
        (slot) => slot.status === "Optimal"
    ).length;

    const efficiencyScore = Math.round((optimalSlots / totalSlots) * 100);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Context-Aware Energy Explanation</h2>
                    <p style={styles.subtitle}>
                        Fan usage is evaluated using timetable, occupancy, and expected energy behavior.
                    </p>
                </div>

                <button
                    style={{
                        ...styles.modeButton,
                        background: mode === "actual" ? "#1D9E75" : "#2B6CB0"
                    }}
                    onClick={() =>
                        setMode((prev) => (prev === "actual" ? "optimized" : "actual"))
                    }
                >
                    {mode === "actual" ? "Actual Mode" : "Optimized Mode"}
                </button>
            </div>

            <div style={styles.summaryGrid}>
                <SummaryCard label="Total Slots" value={totalSlots} />
                <SummaryCard label="Inefficient Slots" value={inefficientSlots} />
                <SummaryCard label="Efficiency Score" value={`${efficiencyScore}%`} />
            </div>

            <div style={styles.sliderCard}>
                <div style={styles.sliderHeader}>
                    <span style={styles.sectionTitle}>Replay Timeline</span>
                    <span style={styles.timelineText}>
                        Slot {selectedIndex + 1} of {totalSlots}
                    </span>
                </div>

                <input
                    type="range"
                    min="0"
                    max={totalSlots - 1}
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                    style={styles.slider}
                />

                <div style={styles.timeLabel}>{selectedSlot.time}</div>
            </div>

            <div style={styles.mainGrid}>
                <TimeSlotCard slot={selectedSlot} large />

                <div style={styles.listPanel}>
                    <div style={styles.sectionTitle}>All Time Slots</div>

                    {processedSlots.map((slot, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            style={{
                                ...styles.slotListItem,
                                border:
                                    selectedIndex === index
                                        ? "1px solid #1D9E75"
                                        : "1px solid #eee",
                                background:
                                    selectedIndex === index ? "#E1F5EE" : "#fff"
                            }}
                        >
                            <div style={styles.slotListTime}>{slot.time}</div>
                            <div style={styles.slotListMeta}>
                                {slot.eventType} · {slot.actualOccupancy} students ·{" "}
                                {slot.status}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>{label}</div>
            <div style={styles.summaryValue}>{value}</div>
        </div>
    );
}

function TimeSlotCard({ slot }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTop}>
                <div>
                    <div style={styles.time}>{slot.time}</div>
                    <div style={styles.event}>{slot.eventType}</div>
                </div>

                <span
                    style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(slot.status)
                    }}
                >
                    {slot.status}
                </span>
            </div>

            <div style={styles.infoGrid}>
                <Info label="Actual Occupancy" value={`${slot.actualOccupancy} students`} />
                <Info label="Expected Occupancy" value={`${slot.expectedOccupancy} students`} />
                <Info label="Fan Usage" value={slot.displayedFanUsage} />
                <Info label="Expected Usage" value={slot.expectedUsage} />
            </div>

            <div style={styles.explanationBox}>
                <div style={styles.explanationTitle}>Explanation</div>
                <div style={styles.explanationText}>{slot.explanation}</div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div style={styles.infoBox}>
            <div style={styles.infoLabel}>{label}</div>
            <div style={styles.infoValue}>{value}</div>
        </div>
    );
}

function getStatusStyle(status) {
    if (status === "Optimal") {
        return {
            background: "#E1F5EE",
            color: "#085041"
        };
    }

    if (status === "Inefficient") {
        return {
            background: "#FCEBEB",
            color: "#8A1C1C"
        };
    }

    return {
        background: "#FFF4D6",
        color: "#8A5A00"
    };
}

const styles = {
    page: {
        padding: "24px",
        background: "#f7f7f7",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    title: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "700",
        color: "#111"
    },
    subtitle: {
        marginTop: "6px",
        marginBottom: 0,
        fontSize: "14px",
        color: "#777"
    },
    modeButton: {
        border: "none",
        color: "white",
        padding: "11px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "700"
    },
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
        marginBottom: "18px"
    },
    summaryCard: {
        background: "white",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "18px"
    },
    summaryLabel: {
        fontSize: "12px",
        color: "#888",
        fontWeight: "700",
        marginBottom: "8px"
    },
    summaryValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#111"
    },
    sliderCard: {
        background: "white",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "18px"
    },
    sliderHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px"
    },
    sectionTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#111",
        letterSpacing: "0.3px"
    },
    timelineText: {
        fontSize: "12px",
        color: "#777"
    },
    slider: {
        width: "100%"
    },
    timeLabel: {
        marginTop: "10px",
        fontSize: "14px",
        fontWeight: "700",
        color: "#1D9E75"
    },
    mainGrid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "18px"
    },
    card: {
        background: "white",
        border: "1px solid #eee",
        borderRadius: "14px",
        padding: "20px"
    },
    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "18px"
    },
    time: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111"
    },
    event: {
        marginTop: "5px",
        fontSize: "14px",
        color: "#777"
    },
    statusBadge: {
        fontSize: "12px",
        fontWeight: "700",
        padding: "6px 10px",
        borderRadius: "8px"
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        marginBottom: "18px"
    },
    infoBox: {
        background: "#fafafa",
        border: "1px solid #f0f0f0",
        borderRadius: "10px",
        padding: "14px"
    },
    infoLabel: {
        fontSize: "12px",
        color: "#888",
        marginBottom: "6px"
    },
    infoValue: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#111"
    },
    explanationBox: {
        background: "#F4FBF8",
        border: "1px solid #D8EEE7",
        borderRadius: "10px",
        padding: "14px"
    },
    explanationTitle: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#085041",
        marginBottom: "6px"
    },
    explanationText: {
        fontSize: "14px",
        color: "#333",
        lineHeight: "1.5"
    },
    listPanel: {
        background: "white",
        border: "1px solid #eee",
        borderRadius: "14px",
        padding: "18px"
    },
    slotListItem: {
        width: "100%",
        textAlign: "left",
        borderRadius: "10px",
        padding: "12px",
        marginTop: "10px",
        cursor: "pointer"
    },
    slotListTime: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#111"
    },
    slotListMeta: {
        marginTop: "4px",
        fontSize: "12px",
        color: "#777"
    }
};

export default EnergyExplanation;