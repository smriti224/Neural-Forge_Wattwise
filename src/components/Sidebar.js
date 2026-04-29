import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
    const role = localStorage.getItem("role");

    return (
        <div style={styles.sidebar}>
            <div style={styles.brand}>
                <div style={styles.logo}>⚡</div>
                <div>
                    <div style={styles.brandTitle}>WattWise</div>
                    <div style={styles.brandSub}>ENERGY MONITOR</div>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>MONITOR</div>
                <SideLink to="/" icon="▦" label="Overview" />
                <SideLink to="/rooms" icon="⌂" label="Rooms" />
            </div>

            {role === "admin" && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>MANAGE</div>
                    <SideLink to="/data-entry" icon="⊕" label="Log Data" />
                    <SideLink to="/timetable" icon="🗓️" label="Timetable" />
                </div>
            )}

            <div style={styles.section}>
                <div style={styles.sectionTitle}>INSIGHTS</div>
                <SideLink to="/analytics" icon="📈" label="Analytics" />
                <SideLink to="/energy-explanation" icon="💡" label="Energy Explanation" />
            </div>

            <div style={styles.footer}>
                <div>Base URL</div>
                <strong>/api/v1</strong>
            </div>
        </div>
    );
}

function SideLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {})
            })}
        >
            <span style={styles.icon}>{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
}

const styles = {
    sidebar: {
        width: "240px",
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid #eee",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        zIndex: 100
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "24px 18px",
        borderBottom: "1px solid #f0f0f0"
    },
    logo: {
        width: "46px",
        height: "46px",
        borderRadius: "10px",
        background: "#247B5A",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px"
    },
    brandTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#222"
    },
    brandSub: {
        fontSize: "11px",
        color: "#999",
        letterSpacing: "0.6px",
        marginTop: "2px"
    },
    section: {
        padding: "18px 14px 4px"
    },
    sectionTitle: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#aaa",
        margin: "0 0 10px 4px"
    },
    link: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "8px",
        textDecoration: "none",
        color: "#666",
        fontSize: "15px",
        marginBottom: "6px"
    },
    activeLink: {
        background: "#E8F5F0",
        color: "#247B5A",
        fontWeight: "700"
    },
    icon: {
        width: "20px",
        textAlign: "center"
    },
    footer: {
        marginTop: "auto",
        padding: "18px",
        fontSize: "12px",
        color: "#777",
        borderTop: "1px solid #f0f0f0"
    }
};

export default Sidebar;