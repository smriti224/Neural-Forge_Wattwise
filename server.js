const express = require("express");
const cors = require("cors");

// Auth routes
const authRoutes = require("./routes/authRoutes");

// WattWise routes
const classroomRoutes = require("./routes/classroomRoutes");
const roomRoutes = require("./routes/roomRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const liveAnalysisRoutes = require("./routes/liveAnalysisRoutes");
const efficiencyRoutes = require("./routes/efficiencyRoutes");
const wasteRoutes = require("./routes/wasteRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const timetableUploadRoutes = require("./routes/timetableUploadRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            server: "running",
            max_occupancy: 60
        }
    });
});

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "WattWise backend is running"
    });
});

// Auth APIs
// POST /api/login
// GET /api/profile
app.use("/api", authRoutes);

// WattWise APIs
app.use("/api/v1/classrooms", classroomRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/analysis", analysisRoutes);
app.use("/api/v1/live-analysis", liveAnalysisRoutes);
app.use("/api/v1/efficiency", efficiencyRoutes);
app.use("/api/v1/waste", wasteRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/timetable-upload", timetableUploadRoutes);

// 404 fallback
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errors: []
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});