import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

const Map = ({ onNeighborhoodSelect }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  // Chicago center coordinates
  const chicagoCenter = [41.8781, -87.6298];

  // TODO: Load actual Chicago neighborhood GeoJSON data
  const neighborhoodData = {
    type: 'FeatureCollection',
    features: []
  };

  const onEachNeighborhood = (feature, layer) => {
    const neighborhoodName = feature.properties.name;

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.7
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.4
        });
      },
      click: (e) => {
        setSelectedNeighborhood(neighborhoodName);
        onNeighborhoodSelect(neighborhoodName);
      }
    });

    layer.bindPopup(`
      <div class="neighborhood-popup">
        <h4>${neighborhoodName}</h4>
        <p>Click for more details</p>
      </div>
    `);
  };

  const neighborhoodStyle = {
    fillColor: '#3388ff',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.4
  };

  return (
    <div className="map-container">
      <MapContainer
        center={chicagoCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {neighborhoodData.features.length > 0 && (
          <GeoJSON
            data={neighborhoodData}
            style={neighborhoodStyle}
            onEachFeature={onEachNeighborhood}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
