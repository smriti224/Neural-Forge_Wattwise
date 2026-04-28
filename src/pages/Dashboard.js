import React from 'react';

const data = {
  efficiency: { room_id: '101', efficiency_score: 72, category: 'moderate' },
  waste: { waste_flags: [
    { type: 'CRITICAL', message: 'AC running in empty room 101' },
    { type: 'WARNING', message: 'Lights on during daytime in room 102' },
    { type: 'INFO', message: 'Room 103 has low occupancy' }
  ]},
  recommendations: [
    { action: 'TURN_OFF_AC', reason: 'Room 101 has been empty for 30 minutes' },
    { action: 'TURN_OFF_LIGHTS', reason: 'Natural light is sufficient in room 102' },
  ],
  savings: { hourly_cost_saved_inr: 120, today_cost_saved_inr: 850, hourly_energy_saved_kwh: 2.5, today_energy_saved_kwh: 10.2 },
  summary: { most_inefficient_room: '101', total_energy_wasted_today: 45.5 }
};

const badgeStyle = (type) => {
  if (type === 'CRITICAL') return { background: '#FCEBEB', color: '#501313' };
  if (type === 'WARNING') return { background: '#FAEEDA', color: '#412402' };
  return { background: '#E6F1FB', color: '#042C53' };
};

function Dashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Syne, sans-serif' }}>
      
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '600' }}>Overview</div>
        <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>Room 101</div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderLeft: '3px solid #1D9E75', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '6px' }}>Efficiency Score</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{data.efficiency.efficiency_score}</div>
          <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>{data.efficiency.category}</div>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderLeft: '3px solid #BA7517', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '6px' }}>Energy Wasted</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{data.summary.total_energy_wasted_today}</div>
          <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>kWh today</div>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderLeft: '3px solid #E24B4A', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '6px' }}>Cost Saved Today</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>₹{data.savings.today_cost_saved_inr}</div>
          <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>INR</div>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderLeft: '3px solid #378ADD', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '6px' }}>Hourly Savings</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>₹{data.savings.hourly_cost_saved_inr}</div>
          <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>per hour</div>
        </div>
      </div>

      {/* Panels Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        
        {/* Waste Flags */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Waste Flags</div>
          {data.waste.waste_flags.map((flag, i) => (
            <div key={i} style={{ ...badgeStyle(flag.type), padding: '8px 10px', borderRadius: '7px', marginBottom: '6px', fontSize: '12px', display: 'flex', gap: '7px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '9px', opacity: 0.7, whiteSpace: 'nowrap', paddingTop: '1px' }}>{flag.type}</span>
              <span>{flag.message}</span>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Recommendations</div>
          {data.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 0', borderBottom: '0.5px solid #f0f0f0' }}>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', background: '#f5f5f5', color: '#888', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{rec.action}</span>
              <span style={{ fontSize: '12px', color: '#333', lineHeight: '1.4' }}>{rec.reason}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;