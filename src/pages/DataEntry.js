import React, { useState } from 'react';

function DataEntry() {
  const [devices, setDevices] = useState({ lights: true, fans: true, ac: false });
  const [submitted, setSubmitted] = useState(false);

  const toggleDevice = (device) => {
    setDevices(prev => ({ ...prev, [device]: !prev[device] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Log Data</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Form */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Classroom Data</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Room ID */}
            <div>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '5px' }}>Room ID</div>
              <input
                defaultValue="101"
                style={{ fontFamily: 'monospace', fontSize: '13px', border: '0.5px solid #e0e0e0', background: '#f5f5f5', color: '#333', padding: '7px 10px', borderRadius: '6px', width: '100%' }}
              />
            </div>

            {/* Occupancy */}
            <div>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '5px' }}>Occupancy</div>
              <input
                type="number"
                defaultValue="0"
                style={{ fontFamily: 'monospace', fontSize: '13px', border: '0.5px solid #e0e0e0', background: '#f5f5f5', color: '#333', padding: '7px 10px', borderRadius: '6px', width: '100%' }}
              />
            </div>

            {/* Timestamp */}
            <div>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '5px' }}>Timestamp</div>
              <input
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                style={{ fontFamily: 'monospace', fontSize: '13px', border: '0.5px solid #e0e0e0', background: '#f5f5f5', color: '#333', padding: '7px 10px', borderRadius: '6px', width: '100%' }}
              />
            </div>

            {/* Devices */}
            <div>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', marginBottom: '8px' }}>Devices</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['lights', 'fans', 'ac'].map(device => (
                  <button
                    key={device}
                    onClick={() => toggleDevice(device)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '7px',
                      border: '0.5px solid',
                      borderColor: devices[device] ? '#9FE1CB' : '#e0e0e0',
                      background: devices[device] ? '#E1F5EE' : '#f5f5f5',
                      color: devices[device] ? '#085041' : '#888',
                      fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                      textTransform: 'capitalize', fontFamily: 'Syne, sans-serif'
                    }}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '9px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
            >
              Submit Entry
            </button>

            {/* Success message */}
            {submitted && (
              <div style={{ background: '#E1F5EE', color: '#085041', padding: '8px 12px', borderRadius: '7px', fontSize: '12px', fontFamily: 'monospace' }}>
                ✓ Data submitted successfully
              </div>
            )}

          </div>
        </div>

        {/* Payload Preview */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Payload Preview</div>
          <div style={{ background: '#f5f5f5', borderRadius: '7px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.8', color: '#333' }}>
            <div><span style={{ color: '#888' }}>room_id:</span> "101"</div>
            <div><span style={{ color: '#888' }}>occupancy:</span> 0</div>
            <div><span style={{ color: '#888' }}>timestamp:</span> "{new Date().toISOString().slice(0, 16)}Z"</div>
            <div><span style={{ color: '#888' }}>lights:</span> <span style={{ color: devices.lights ? '#1D9E75' : '#E24B4A' }}>{devices.lights.toString()}</span></div>
            <div><span style={{ color: '#888' }}>fans:</span> <span style={{ color: devices.fans ? '#1D9E75' : '#E24B4A' }}>{devices.fans.toString()}</span></div>
            <div><span style={{ color: '#888' }}>ac:</span> <span style={{ color: devices.ac ? '#1D9E75' : '#E24B4A' }}>{devices.ac.toString()}</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DataEntry;