import React from 'react';
// Recharts imports will be added when crime data visualization is implemented
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ neighborhood, data, selectedHousing, onHousingSelect }) => {
  if (!data) {
    return <div className="dashboard-empty">Select a neighborhood to see details</div>;
  }

  const handleHousingCardClick = (house) => {
    if (onHousingSelect) {
      onHousingSelect(house);
    }
  };

  return (
    <div className="dashboard-container">
      {neighborhood && <h2>{neighborhood}</h2>}
      {!neighborhood && data.housing && data.housing.length > 0 && (
        <h2>Found {data.housing.length} Properties</h2>
      )}

      <div className="dashboard-section">
        <h3>Affordable Housing</h3>
        <div className="data-cards">
          {data.housing && data.housing.length > 0 ? (
            data.housing.slice(0, 10).map((house, idx) => {
              const isSelected = selectedHousing && selectedHousing.address === house.address;
              return (
                <div 
                  key={idx} 
                  className={`data-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleHousingCardClick(house)}
                  style={{ cursor: 'pointer' }}
                >
                  {house.address && (
                    <p><strong>Address:</strong> {house.address}</p>
                  )}
                  {house.price && (
                    <p className="housing-price"><strong>Price:</strong> {house.price}</p>
                  )}
                  {house.bedrooms && house.bathrooms && (
                    <p><strong>Bed/Bath:</strong> {house.bedrooms} bed, {house.bathrooms} bath</p>
                  )}
                  {house.property_type && (
                    <p><strong>Type:</strong> {house.property_type}</p>
                  )}
                  {house.units && (
                    <p><strong>Units:</strong> {house.units}</p>
                  )}
                  {house.latitude && house.longitude && (
                    <p className="coordinates">
                      📍 {house.latitude.toFixed(4)}, {house.longitude.toFixed(4)}
                    </p>
                  )}
                  {isSelected && (
                    <p className="selected-indicator">✓ Selected</p>
                  )}
                </div>
              );
            })
          ) : (
            <p>No housing data available</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Crime Statistics</h3>
        {data.crime && Object.keys(data.crime).length > 0 ? (
          <div className="chart-container">
            {data.crime.safety_score !== undefined && (
              <div className="crime-score">
                <strong>Safety Score: </strong>
                <span className={`score-value ${data.crime.safety_score >= 7 ? 'good' : data.crime.safety_score >= 5 ? 'moderate' : 'low'}`}>
                  {data.crime.safety_score}/10
                </span>
              </div>
            )}
            {data.crime.total_incidents !== undefined && (
              <p><strong>Total Incidents:</strong> {data.crime.total_incidents}</p>
            )}
            {data.crime.trend && (
              <p><strong>Trend:</strong> {data.crime.trend}</p>
            )}
            {data.crime.by_type && Object.keys(data.crime.by_type).length > 0 && (
              <div className="crime-by-type">
                <strong>By Type:</strong>
                <ul>
                  {Object.entries(data.crime.by_type).map(([type, count]) => (
                    <li key={type}>{type}: {count}</li>
                  ))}
                </ul>
              </div>
            )}
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
            {data.summary.safety_level && (
              <p className="safety-level">Safety Level: {data.summary.safety_level}</p>
            )}
          </div>
        ) : (
          <p>Ask the chatbot for more information about schools, restaurants, and safety!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
