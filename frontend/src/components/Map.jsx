import React, { useState, useCallback, useEffect } from 'react';
import MapGL, { Source, Layer, Popup, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

const Map3D = ({ onNeighborhoodSelect, housingResults = [], selectedHousing, onHousingSelect }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -87.6298,
    latitude: 41.8781,
    zoom: 11,
    pitch: 45,
    bearing: 0
  });
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [housingPopupInfo, setHousingPopupInfo] = useState(null);

  // Fly to housing location when selected
  useEffect(() => {
    if (selectedHousing && selectedHousing.latitude && selectedHousing.longitude) {
      setViewState(prev => ({
        ...prev,
        longitude: selectedHousing.longitude,
        latitude: selectedHousing.latitude,
        zoom: 14,
        pitch: 45
      }));
      setHousingPopupInfo(selectedHousing);
    }
  }, [selectedHousing]);

  // Fit bounds to show all housing markers when results arrive
  useEffect(() => {
    if (housingResults.length > 0) {
      const lngs = housingResults.map(h => h.longitude).filter(Boolean);
      const lats = housingResults.map(h => h.latitude).filter(Boolean);
      
      if (lngs.length > 0 && lats.length > 0) {
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        
        // Calculate center and appropriate zoom
        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;
        
        setViewState(prev => ({
          ...prev,
          longitude: centerLng,
          latitude: centerLat,
          zoom: Math.max(11, prev.zoom) // Don't zoom too far in if only a few results
        }));
      }
    }
  }, [housingResults.length]);

  // Load GeoJSON data (initially empty, will be loaded from API or local file)
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const response = await fetch('/api/neighborhoods/geojson');
        if (response.ok) {
          const data = await response.json();
          setNeighborhoodData(data);
        } else {
          setNeighborhoodData(createSampleGeoJSON());
        }
      } catch (error) {
        console.warn('Could not load GeoJSON from API, using sample data:', error);
        setNeighborhoodData(createSampleGeoJSON());
      }
    };

    loadGeoJSON();
  }, []);

  // Sample GeoJSON for key Chicago neighborhoods
  const createSampleGeoJSON = () => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Logan Square', community_area: 22 },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.70, 41.93], [-87.69, 41.93], [-87.69, 41.92],
              [-87.70, 41.92], [-87.70, 41.93]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Wicker Park', community_area: 24 },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.68, 41.91], [-87.67, 41.91], [-87.67, 41.90],
              [-87.68, 41.90], [-87.68, 41.91]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Lincoln Park', community_area: 7 },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.64, 41.93], [-87.63, 41.93], [-87.63, 41.92],
              [-87.64, 41.92], [-87.64, 41.93]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Hyde Park', community_area: 41 },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.60, 41.80], [-87.59, 41.80], [-87.59, 41.79],
              [-87.60, 41.79], [-87.60, 41.80]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Pilsen', community_area: 31 },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.67, 41.86], [-87.66, 41.86], [-87.66, 41.85],
              [-87.67, 41.85], [-87.67, 41.86]
            ]]
          }
        }
      ]
    };
  };

  const onMapClick = useCallback((event) => {
    const feature = event.features?.[0];
    if (feature && feature.properties && feature.properties.name) {
      const neighborhoodName = feature.properties.name;
      setSelectedNeighborhood(neighborhoodName);
      setPopupInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        name: neighborhoodName
      });
      onNeighborhoodSelect(neighborhoodName);
    }
  }, [onNeighborhoodSelect]);

  const onHover = useCallback((event) => {
    const feature = event.features?.[0];
    setHoveredNeighborhood(
      feature?.properties?.name || null
    );
  }, []);

  const onHousingMarkerClick = useCallback((housing) => {
    setHousingPopupInfo(housing);
    if (onHousingSelect) {
      onHousingSelect(housing);
    }
  }, [onHousingSelect]);


  // Layer styles
  const fillLayerStyle = {
    id: 'neighborhood-fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'name'], selectedNeighborhood],
        '#ff6b6b',
        ['==', ['get', 'name'], hoveredNeighborhood],
        '#4ecdc4',
        '#3388ff'
      ],
      'fill-opacity': [
        'case',
        ['==', ['get', 'name'], selectedNeighborhood],
        0.8,
        ['==', ['get', 'name'], hoveredNeighborhood],
        0.6,
        0.4
      ]
    }
  };

  const outlineLayerStyle = {
    id: 'neighborhood-outline',
    type: 'line',
    paint: {
      'line-color': '#ffffff',
      'line-width': 2,
      'line-opacity': 0.8
    }
  };

  const extrudedLayerStyle = {
    id: 'neighborhood-extruded',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': [
        'case',
        ['==', ['get', 'name'], selectedNeighborhood],
        '#ff6b6b',
        ['==', ['get', 'name'], hoveredNeighborhood],
        '#4ecdc4',
        '#3388ff'
      ],
      'fill-extrusion-height': [
        'case',
        ['==', ['get', 'name'], selectedNeighborhood],
        500,
        ['==', ['get', 'name'], hoveredNeighborhood],
        300,
        100
      ],
      'fill-extrusion-opacity': 0.6
    }
  };


  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

  if (!neighborhoodData) {
    return (
      <div className="map-container map-loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapGL
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={onMapClick}
        onMouseMove={onHover}
        interactiveLayerIds={['neighborhood-fill']}
      >
        {neighborhoodData && (
          <Source id="neighborhoods" type="geojson" data={neighborhoodData}>
            <Layer {...fillLayerStyle} />
            <Layer {...outlineLayerStyle} />
            <Layer {...extrudedLayerStyle} />
          </Source>
        )}


        {/* Neighborhood Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
          >
            <div className="neighborhood-popup">
              <h4>{popupInfo.name}</h4>
              <p>Click for more details</p>
            </div>
          </Popup>
        )}

        {/* Housing Popup - Comprehensive */}
        {housingPopupInfo && housingPopupInfo.latitude && housingPopupInfo.longitude && (
          <Popup
            longitude={housingPopupInfo.longitude}
            latitude={housingPopupInfo.latitude}
            closeOnClick={false}
            onClose={() => setHousingPopupInfo(null)}
            anchor="bottom"
          >
            <div className="housing-popup">
              <h4>{housingPopupInfo.address}</h4>
              {housingPopupInfo.price && (
                <p className="housing-price">{housingPopupInfo.price}</p>
              )}
              <div className="housing-details">
                {housingPopupInfo.bedrooms && housingPopupInfo.bathrooms && (
                  <p>{housingPopupInfo.bedrooms} bed, {housingPopupInfo.bathrooms} bath</p>
                )}
                {housingPopupInfo.property_type && (
                  <p className="property-type">{housingPopupInfo.property_type}</p>
                )}
                {housingPopupInfo.neighborhood && (
                  <p className="neighborhood-name">📍 {housingPopupInfo.neighborhood}</p>
                )}
              </div>

              {/* Crime Statistics */}
              {housingPopupInfo.crime && (
                <div className="crime-stats-popup">
                  <strong>🛡️ Safety: </strong>
                  {housingPopupInfo.crime.safety_score !== undefined && (
                    <span>{housingPopupInfo.crime.safety_score}/10</span>
                  )}
                  {housingPopupInfo.crime.total_incidents !== undefined && (
                    <div className="crime-details">
                      {housingPopupInfo.crime.total_incidents} incidents
                      {housingPopupInfo.crime.trend && (
                        <span className={`trend ${housingPopupInfo.crime.trend}`}>
                          ({housingPopupInfo.crime.trend})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Neighborhood Data */}
              {housingPopupInfo.neighborhood_data && (
                <div className="neighborhood-data-popup">
                  {housingPopupInfo.neighborhood_data.summary && (
                    <p className="neighborhood-summary">{housingPopupInfo.neighborhood_data.summary}</p>
                  )}
                  {housingPopupInfo.neighborhood_data.safety_level && (
                    <span className="safety-badge">
                      {housingPopupInfo.neighborhood_data.safety_level} safety
                    </span>
                  )}
                </div>
              )}

              <button 
                className="view-details-btn"
                onClick={() => {
                  if (onHousingSelect) {
                    onHousingSelect(housingPopupInfo);
                  }
                }}
              >
                View Full Details
              </button>
            </div>
          </Popup>
        )}

        {/* Housing Markers as interactive points */}
        {housingResults.map((housing, idx) => {
          if (!housing.latitude || !housing.longitude) return null;
          return (
            <Marker
              key={housing.address || idx}
              longitude={housing.longitude}
              latitude={housing.latitude}
              anchor="bottom"
            >
              <div
                className={`housing-marker ${selectedHousing?.address === housing.address ? 'selected' : ''}`}
                onClick={() => onHousingMarkerClick(housing)}
              >
                🏠
              </div>
            </Marker>
          );
        })}

        <div className="map-controls">
          <button
            className="control-button"
            onClick={() => setViewState({
              ...viewState,
              pitch: viewState.pitch === 0 ? 45 : 0,
              bearing: 0
            })}
            title="Toggle 3D view"
          >
            {viewState.pitch > 0 ? '2D' : '3D'}
          </button>
        </div>
      </MapGL>
    </div>
  );
};

export default Map3D;
