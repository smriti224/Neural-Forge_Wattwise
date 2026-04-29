import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login");
    };

    return (
        <button onClick={handleLogout} style={styles.button}>
            Logout
        </button>
    );
}

const styles = {
    button: {
        height: "40px",
        padding: "0 16px",
        border: "none",
        borderRadius: "10px",
        background: "#FCEBEB",
        color: "#7A1F1F",
        fontWeight: "700",
        cursor: "pointer",
        whiteSpace: "nowrap"
    }
};

export default LogoutButton;