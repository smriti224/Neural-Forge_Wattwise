import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const wasteData = {
  labels: ['Wasted', 'Saved'],
  datasets: [{ data: [120, 300], backgroundColor: ['#E24B4A', '#1D9E75'], borderWidth: 0 }]
};

const compData = {
  labels: ['Energy (kWh)'],
  datasets: [
    { label: 'Before', data: [120], backgroundColor: '#D85A3033', borderColor: '#D85A30', borderWidth: 1.5 },
    { label: 'After', data: [80], backgroundColor: '#1D9E7533', borderColor: '#1D9E75', borderWidth: 1.5 }
  ]
};

const efficiencyData = {
  labels: ['Room 101', 'Room 102', 'Room 103', 'Room 104'],
  datasets: [{
    label: 'Score',
    data: [72, 88, 45, 91],
    backgroundColor: ['#BA751733', '#1D9E7533', '#E24B4A33', '#1D9E7533'],
    borderColor: ['#BA7517', '#1D9E75', '#E24B4A', '#1D9E75'],
    borderWidth: 1.5
  }]
};

const cardStyle = { background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '10px', padding: '14px' };
const titleStyle = { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' };

function Analytics() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Analytics</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        
        {/* Waste Overview */}
        <div style={cardStyle}>
          <div style={titleStyle}>Waste Overview</div>
          <div style={{ height: '160px' }}>
            <Doughnut data={wasteData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#E24B4A' }}>120</div>
              <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace' }}>kWh wasted</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1D9E75' }}>300</div>
              <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace' }}>kWh saved</div>
            </div>
          </div>
        </div>

        {/* Before vs After */}
        <div style={cardStyle}>
          <div style={titleStyle}>Before vs After</div>
          <div style={{ height: '160px' }}>
            <Bar data={compData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, scales: { y: { min: 0 } } }} />
          </div>
        </div>

        {/* Room Efficiency */}
        <div style={cardStyle}>
          <div style={titleStyle}>Room Efficiency</div>
          <div style={{ height: '160px' }}>
            <Bar data={efficiencyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;