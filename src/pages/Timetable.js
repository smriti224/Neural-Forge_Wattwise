import React, { useState } from 'react';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const dummySchedule = {
  monday: [
    { start_time: '09:00', end_time: '10:00', label: 'Math Lecture' },
    { start_time: '11:00', end_time: '12:00', label: 'Physics Lab' },
  ],
  wednesday: [
    { start_time: '10:00', end_time: '11:30', label: 'Chemistry' },
  ],
  friday: [
    { start_time: '09:00', end_time: '10:00', label: 'Biology' },
    { start_time: '14:00', end_time: '15:00', label: 'Computer Science' },
  ]
};

function Timetable() {
  const [activeDay, setActiveDay] = useState('monday');

  const slots = dummySchedule[activeDay] || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Timetable</div>

      {/* Room selector */}
      <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '8px' }}>Room</div>
        <select style={{ fontFamily: 'monospace', fontSize: '13px', border: '0.5px solid #e0e0e0', background: '#f5f5f5', padding: '6px 10px', borderRadius: '6px', width: '100%' }}>
          <option>101</option>
          <option>102</option>
          <option>103</option>
          <option>104</option>
        </select>
      </div>

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: '2px', padding: '4px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '12px' }}>
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            style={{
              flex: 1, padding: '5px', textAlign: 'center', borderRadius: '6px',
              fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: 'none',
              background: activeDay === day ? 'white' : 'transparent',
              color: activeDay === day ? '#333' : '#888',
              textTransform: 'capitalize'
            }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Slots */}
      <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} Schedule
        </div>
        {slots.length === 0 ? (
          <div style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace', padding: '20px 0', textAlign: 'center' }}>
            No classes scheduled
          </div>
        ) : (
          slots.map((slot, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < slots.length - 1 ? '0.5px solid #f0f0f0' : 'none' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', width: '100px', flexShrink: 0 }}>
                {slot.start_time} – {slot.end_time}
              </span>
              <span style={{ fontSize: '12px', color: '#333', flex: 1 }}>{slot.label}</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: '#E6F1FB', color: '#042C53', fontFamily: 'monospace' }}>
                {activeDay.slice(0, 3)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Timetable;