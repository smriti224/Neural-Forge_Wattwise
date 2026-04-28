import React from 'react';
import DataEntry from './pages/DataEntry';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/RoomDetail';
import Timetable from './pages/Timetable';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Navbar />
        <div style={{ marginLeft: '200px', flex: 1, minHeight: '100vh', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rooms" element={<RoomDetail />} />
            <Route path="/room/:room_id" element={<RoomDetail />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/data-entry" element={<DataEntry />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;