import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div>
      <Link to="/">Dashboard</Link>
      <Link to="/timetable">Timetable</Link>
      <Link to="/analytics">Analytics</Link>
    </div>
  );
}

export default Sidebar;