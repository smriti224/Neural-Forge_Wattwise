import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return children;
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
    },
    card: {
        background: "white",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #eee",
        textAlign: "center"
    }
};

export default ProtectedRoute;