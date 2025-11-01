import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ neighborhood, data }) => {
  if (!data) {
    return <div className="dashboard-empty">Select a neighborhood to see details</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>{neighborhood}</h2>

      <div className="dashboard-section">
        <h3>Affordable Housing</h3>
        <div className="data-cards">
          {data.housing && data.housing.length > 0 ? (
            data.housing.slice(0, 5).map((house, idx) => (
              <div key={idx} className="data-card">
                <p><strong>Type:</strong> {house.property_type || 'N/A'}</p>
                <p><strong>Units:</strong> {house.units || 'N/A'}</p>
                <p><strong>Address:</strong> {house.address || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p>No housing data available</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Crime Statistics</h3>
        {data.crime && Object.keys(data.crime).length > 0 ? (
          <div className="chart-container">
            {/* TODO: Add actual crime data visualization */}
            <p>Crime data visualization coming soon</p>
          </div>
        ) : (
          <p>No crime data available</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>311 Service Calls</h3>
        {data.calls_311 && data.calls_311.length > 0 ? (
          <div className="data-list">
            {data.calls_311.slice(0, 10).map((call, idx) => (
              <div key={idx} className="data-item">
                <p><strong>{call.request_type || 'Service Request'}</strong></p>
                <p>{call.description || 'No description'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No 311 call data available</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Summary</h3>
        {data.summary ? (
          <div className="summary-box">
            <p>{data.summary.text || 'Neighborhood summary will appear here'}</p>
          </div>
        ) : (
          <p>Ask the chatbot for more information about schools, restaurants, and safety!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
