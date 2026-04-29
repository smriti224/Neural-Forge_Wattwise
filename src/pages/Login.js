import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("admin@demo.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await loginUser(email, password);

            localStorage.setItem("token", result.token);
            localStorage.setItem("role", result.role);
            localStorage.setItem("email", email);

            navigate("/");
        } catch (err) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logoBox}>⚡</div>

                <h1 style={styles.title}>WattWise Login</h1>
                <p style={styles.subtitle}>Department Energy Dashboard</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="admin@demo.com"
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="admin123"
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div style={styles.demoBox}>
                    <div style={styles.demoTitle}>Demo Logins</div>
                    <div>HOD/Admin: admin@demo.com / admin123</div>
                    <div>User: user@demo.com / user123</div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f4f7f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
    },
    card: {
        width: "380px",
        background: "white",
        borderRadius: "18px",
        padding: "32px",
        boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
        border: "1px solid #eee"
    },
    logoBox: {
        width: "48px",
        height: "48px",
        background: "#1D9E75",
        color: "white",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        marginBottom: "18px"
    },
    title: {
        margin: 0,
        fontSize: "24px",
        color: "#111"
    },
    subtitle: {
        marginTop: "6px",
        marginBottom: "24px",
        color: "#777",
        fontSize: "14px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    label: {
        display: "block",
        fontSize: "12px",
        color: "#777",
        fontWeight: "700",
        marginBottom: "6px"
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box"
    },
    button: {
        background: "#1D9E75",
        color: "white",
        border: "none",
        padding: "12px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "14px"
    },
    error: {
        background: "#FCEBEB",
        color: "#501313",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "13px"
    },
    demoBox: {
        marginTop: "22px",
        background: "#f7f7f7",
        borderRadius: "10px",
        padding: "12px",
        fontSize: "12px",
        color: "#555",
        lineHeight: "1.7"
    },
    demoTitle: {
        fontWeight: "700",
        color: "#111",
        marginBottom: "4px"
    }
};

export default Login;
