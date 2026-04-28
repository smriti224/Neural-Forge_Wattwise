import React from 'react';
import { useNavigate } from 'react-router-dom';

const rooms = [
  { room_id: '101', efficiency_score: 72, category: 'moderate' },
  { room_id: '102', efficiency_score: 88, category: 'optimal' },
  { room_id: '103', efficiency_score: 45, category: 'inefficient' },
  { room_id: '104', efficiency_score: 91, category: 'optimal' },
];

const scoreColor = (score) => {
  if (score >= 80) return '#1D9E75';
  if (score >= 50) return '#BA7517';
  return '#E24B4A';
};

function RoomDetail() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>All Rooms</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rooms.map((room) => (
          <div
            key={room.room_id}
            onClick={() => navigate(`/room/${room.room_id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'white', border: '0.5px solid #e0e0e0',
              borderRadius: '8px', padding: '12px 14px', cursor: 'pointer'
            }}
          >
            {/* Room ID */}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '500', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
              Room {room.room_id}
            </span>

            {/* Score bar */}
            <div style={{ flex: 1, height: '4px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${room.efficiency_score}%`, background: scoreColor(room.efficiency_score), borderRadius: '2px' }} />
            </div>

            {/* Score value */}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600', color: scoreColor(room.efficiency_score), width: '30px', textAlign: 'right' }}>
              {room.efficiency_score}
            </span>

            {/* Category badge */}
            <span style={{
              fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', fontWeight: '500',
              background: room.category === 'optimal' ? '#E1F5EE' : room.category === 'moderate' ? '#FAEEDA' : '#FCEBEB',
              color: room.category === 'optimal' ? '#085041' : room.category === 'moderate' ? '#633806' : '#501313'
            }}>
              {room.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomDetail;