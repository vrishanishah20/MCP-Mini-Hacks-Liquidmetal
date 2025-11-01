import React, { useState } from 'react';
import './App.css';
import Chatbot from './components/Chatbot';
import Map3D from './components/Map';
import Dashboard from './components/Dashboard';
import { neighborhoodAPI } from './services/api';

function App() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [housingResults, setHousingResults] = useState([]);
  const [selectedHousing, setSelectedHousing] = useState(null);

  const handleNeighborhoodSelect = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    // Fetch dashboard data for the selected neighborhood
    fetchDashboardData(neighborhood);
  };

  const fetchDashboardData = async (neighborhood) => {
    if (!neighborhood) return;
    
    setIsLoadingDashboard(true);
    try {
      const data = await neighborhoodAPI.getDashboard(neighborhood);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data structure on error
      setDashboardData({
        neighborhood,
        housing: [],
        crime: {},
        calls_311: [],
        summary: null
      });
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleHousingResults = (data) => {
    if (data && data.housing && Array.isArray(data.housing)) {
      // Merge shared crime/neighborhood data with each housing object if needed
      const housingWithContext = data.housing.map(housing => ({
        ...housing,
        crime: housing.crime || data.crime || null,
        neighborhood_data: housing.neighborhood_data || {
          summary: data.summary?.text || null,
          safety_level: data.summary?.safety_level || null
        }
      }));
      
      setHousingResults(housingWithContext);
      setDashboardData(data);
      
      // Optionally: Fly map to show all markers
      if (housingWithContext.length > 0) {
        // Map component will handle fitting bounds
      }
    }
  };

  const handleHousingSelect = (housing) => {
    setSelectedHousing(housing);
    // Update viewState to fly to housing location (handled in Map component)
  };

  const handleClearResults = () => {
    setHousingResults([]);
    setSelectedHousing(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chicago Real Estate Assistant</h1>
        <p>Explore neighborhoods with comprehensive data</p>
      </header>

      <div className="main-content">
        <div className="map-section">
          <Map3D 
            onNeighborhoodSelect={handleNeighborhoodSelect}
            housingResults={housingResults}
            selectedHousing={selectedHousing}
            onHousingSelect={handleHousingSelect}
          />
        </div>

        <div className="info-section">
          {isLoadingDashboard ? (
            <div className="dashboard-loading">
              <p>Loading neighborhood data...</p>
            </div>
          ) : dashboardData ? (
            <Dashboard
              neighborhood={selectedNeighborhood}
              data={dashboardData}
              selectedHousing={selectedHousing}
              onHousingSelect={handleHousingSelect}
            />
          ) : (
            <div className="dashboard-empty-state">
              <p>Select a neighborhood on the map or ask the chatbot to see detailed information</p>
            </div>
          )}
        </div>
      </div>

      <div className="chatbot-section">
        <Chatbot
          selectedNeighborhood={selectedNeighborhood}
          onNeighborhoodMention={handleNeighborhoodSelect}
          onHousingResults={handleHousingResults}
        />
      </div>
    </div>
  );
}

export default App;
