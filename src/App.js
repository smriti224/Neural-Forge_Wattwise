import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import Analytics from "./pages/Analytics";
import RoomDetail from "./pages/RoomDetail";
import Timetable from "./pages/Timetable";
import Login from "./pages/Login";
import EnergyExplanation from "./pages/EnergyExplanation";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout({ children }) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />

            <div
                style={{
                    flex: 1,
                    marginLeft: "240px",
                    background: "#f5f5f5",
                    minHeight: "100vh"
                }}
            >
                {children}
            </div>
        </div>
    );
}

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshData = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "user"]}>
                            <AppLayout>
                                <Dashboard refreshKey={refreshKey} />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/rooms"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "user"]}>
                            <AppLayout>
                                <RoomDetail refreshKey={refreshKey} />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/data-entry"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AppLayout>
                                <DataEntry onDataSaved={refreshData} />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/timetable"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AppLayout>
                                <Timetable refreshKey={refreshKey} />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "user"]}>
                            <AppLayout>
                                <Analytics refreshKey={refreshKey} />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/energy-explanation"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "user"]}>
                            <AppLayout>
                                <EnergyExplanation />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;