import React, { useState } from 'react';
import './App.css';
import Chatbot from './components/Chatbot';
import Map from './components/Map';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const handleNeighborhoodSelect = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    // Fetch dashboard data for the selected neighborhood
    fetchDashboardData(neighborhood);
  };

  const fetchDashboardData = async (neighborhood) => {
    try {
      const response = await fetch(`/api/dashboard/${neighborhood}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chicago Real Estate Assistant</h1>
        <p>Explore neighborhoods with comprehensive data</p>
      </header>

      <div className="main-content">
        <div className="map-section">
          <Map onNeighborhoodSelect={handleNeighborhoodSelect} />
        </div>

        <div className="info-section">
          {dashboardData && (
            <Dashboard
              neighborhood={selectedNeighborhood}
              data={dashboardData}
            />
          )}
        </div>
      </div>

      <Chatbot
        selectedNeighborhood={selectedNeighborhood}
        onNeighborhoodMention={handleNeighborhoodSelect}
      />
    </div>
  );
}

export default App;
