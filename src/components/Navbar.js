import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/rooms', label: 'All Rooms' },
    { path: '/data-entry', label: 'Log Data' },
    { path: '/timetable', label: 'Timetable' },
    { path: '/analytics', label: 'Analytics' },
  ];

  return (
    <div style={{ width: '200px', flexShrink: 0, background: 'white', borderRight: '0.5px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '0.5px solid #e0e0e0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1D9E75', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>⚡</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>WattWise</div>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Energy Monitor</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: isActive ? '#085041' : '#888',
                background: isActive ? '#E1F5EE' : 'transparent',
                textDecoration: 'none',
                marginBottom: '2px'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive ? '#1D9E75' : '#ccc',
                flexShrink: 0,
                display: 'inline-block'
              }}></span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Navbar;