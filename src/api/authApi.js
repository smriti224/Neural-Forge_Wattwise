const AUTH_BASE_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${AUTH_BASE_URL}/profile`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unauthorized");
    }

    return data;
};