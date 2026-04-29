const BASE_URL = "http://localhost:5000/api/v1";
const AUTH_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            ...(options.headers || {})
        }
    });

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
            `API did not return JSON. Check backend route: ${BASE_URL}${endpoint}`
        );
    }

    const result = await response.json();

    if (!response.ok || result.status === "error") {
        throw new Error(result.message || "API request failed");
    }

    return result.data;
}

/* ---------------- AUTH ---------------- */

export const loginUser = async (email, password) => {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Login failed");
    }

    return result;
};

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${AUTH_BASE_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Unauthorized");
    }

    return result;
};

/* ---------------- CLASSROOM DATA ---------------- */

export const submitClassroomData = async (payload) => {
    return apiRequest("/classrooms/data", {
        method: "POST",
        body: JSON.stringify(payload)
    });
};

/* ---------------- ANALYSIS ---------------- */

export const getAnalysis = async (roomId) => {
    return apiRequest(`/analysis/${roomId}`);
};

export const getLiveAnalysis = async (roomId) => {
    return apiRequest(`/live-analysis/${roomId}`);
};

/* ---------------- WASTE ---------------- */

export const getWaste = async (roomId) => {
    return apiRequest(`/waste/${roomId}`);
};

/* ---------------- EFFICIENCY ---------------- */

export const getEfficiency = async (roomId) => {
    return apiRequest(`/efficiency/${roomId}`);
};

/* ---------------- RECOMMENDATIONS ---------------- */

export const getRecommendations = async (roomId) => {
    return apiRequest(`/recommendations/${roomId}`);
};

/* ---------------- TIMETABLE ---------------- */

export const postTimetable = async (payload) => {
    return apiRequest("/timetable", {
        method: "POST",
        body: JSON.stringify(payload)
    });
};

export const getTimetable = async (roomId) => {
    return apiRequest(`/timetable/${roomId}`);
};

export const uploadTimetableFile = async (file, roomId = "") => {
    const formData = new FormData();

    formData.append("file", file);

    if (roomId) {
        formData.append("room_id", roomId);
    }

    return apiRequest("/timetable-upload", {
        method: "POST",
        body: formData
    });
};

/* ---------------- ROOMS ---------------- */

export const getRooms = async () => {
    return apiRequest("/rooms");
};

export const addRoom = async (payload) => {
    return apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify(payload)
    });
};

export const createRoom = addRoom;

export const deleteRoom = async (roomId) => {
    return apiRequest(`/rooms/${roomId}`, {
        method: "DELETE"
    });
};

/* ---------------- ANALYTICS ---------------- */

export const getWasteOverview = async () => {
    return apiRequest("/analytics/waste-overview");
};

export const getEfficiencyOverview = async () => {
    const data = await apiRequest("/analytics/efficiency");

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.rooms)) return data.rooms;

    return [];
};

export const getComparison = async (roomId, period = "this_week") => {
    return apiRequest(`/analytics/comparison/${roomId}?period=${period}`);
};