# Developer 2: Frontend Workflow Plan - Updated

## Workflow Overview

### User Journey:
1. **User asks in chatbot**: "I need 2 bed 1 bath affordable housing" (natural language)
2. **Frontend sends to backend**: POST `/api/chat` with message
3. **Backend processes** (Developer 3):
   - LLM parses natural language query
   - Queries Raindrop MCP / Database for:
     - Affordable housing matching criteria (2 bed, 1 bath)
     - Returns: addresses, lat/long coordinates, property details
     - Crime statistics for those areas
     - Other relevant neighborhood data
4. **Backend returns** structured response:
   ```json
   {
     "response": "I found 5 affordable housing options...",
     "data": {
       "housing": [
         {
           "address": "123 Main St, Chicago, IL",
           "latitude": 41.8781,
           "longitude": -87.6298,
           "bedrooms": 2,
           "bathrooms": 1,
           "price": "$800/month",
           "units": 5,
           "property_type": "Apartment",
           "neighborhood": "Logan Square"
         },
         // ... more housing results
       ],
       "crime": {
         "neighborhood": "Logan Square",
         "total_incidents": 45,
         "by_type": {...},
         "safety_score": 7.5
       },
       "summary": "Logan Square has moderate crime rates..."
     }
   }
   ```
5. **Frontend displays**:
   - LLM text response in chatbot ✅
   - Housing markers on map (lat/long) ⏳
   - Click marker → Show address popup ⏳
   - All data in dashboard (housing cards, crime stats) ⏳

---

## Current State Review

### ✅ Already Implemented

1. **Chatbot Component** (`frontend/src/components/Chatbot.jsx`)
   - ✅ Sends natural language to `/api/chat`
   - ✅ Displays LLM text response
   - ✅ Shows loading states
   - ⏳ Needs: Extract housing data from response

2. **Map Component** (`frontend/src/components/Map.jsx`)
   - ✅ 3D Mapbox map with neighborhoods
   - ✅ Neighborhood click selection
   - ⏳ Missing: Housing location markers
   - ⏳ Missing: Marker click → Address popup

3. **Dashboard Component** (`frontend/src/components/Dashboard.jsx`)
   - ✅ Displays housing cards (address, type, units)
   - ✅ Shows crime statistics section
   - ⏳ Needs: Click housing card → Highlight on map

4. **App Component** (`frontend/src/App.jsx`)
   - ✅ State management for neighborhood
   - ✅ API integration
   - ⏳ Missing: State for housing results from chatbot
   - ⏳ Missing: Pass housing data to map for markers

5. **API Service** (`frontend/src/services/api.js`)
   - ✅ `/api/chat` endpoint configured
   - ⏳ Needs: Helper to parse response data structure

---

## Required Frontend Updates

### Phase 1: Enhance Chatbot Response Handling

**File**: `frontend/src/components/Chatbot.jsx`

**Updates Needed**:
1. **Extract housing data from backend response**
   ```javascript
   // When backend returns response.data.housing
   if (response.data.data && response.data.data.housing) {
     // Pass housing data to parent (App.jsx)
     onHousingResults(response.data.data);
   }
   ```

2. **Display structured data in chat** (optional)
   - Show count: "Found 5 properties"
   - Quick action: "Show on map" button

3. **Handle mixed response formats**
   - Support `response.data.response` (text)
   - Support `response.data.data` (structured data)
   - Support `response.data.answer` (alternative field)

**New Props Needed**:
```javascript
<Chatbot
  selectedNeighborhood={selectedNeighborhood}
  onNeighborhoodMention={handleNeighborhoodSelect}
  onHousingResults={handleHousingResults}  // NEW
/>
```

---

### Phase 2: Add Housing Markers to Map

**File**: `frontend/src/components/Map.jsx`

**Updates Needed**:
1. **Accept housing data as prop**
   ```javascript
   const Map3D = ({ onNeighborhoodSelect, housingResults }) => {
     // housingResults = array of housing objects with lat/long
   }
   ```

2. **Create marker layer for housing**
   - Use Mapbox Marker component or custom markers
   - Position markers at housing coordinates
   - Different marker style for different property types

3. **Marker click handler**
   ```javascript
   const onMarkerClick = (housing) => {
     setPopupInfo({
       longitude: housing.longitude,
       latitude: housing.latitude,
       address: housing.address,
       price: housing.price,
       bedrooms: housing.bedrooms,
       bathrooms: housing.bathrooms,
       property_type: housing.property_type,
       neighborhood: housing.neighborhood,
       // Crime stats should come from backend response (same neighborhood)
       crime: housing.crime || null,
       neighborhood_data: housing.neighborhood_data || null,
       details: housing
     });
     onHousingSelect(housing);
   };
   ```

4. **Enhanced popup content** - Display comprehensive information:
   - **Address**: Full address (from backend)
   - **Price**: Monthly/rent price (from backend)
   - **Property Details**: Bedrooms, bathrooms, property type
   - **Neighborhood**: Neighborhood name
   - **Crime Statistics**: Total incidents, safety score (from backend)
   - **Neighborhood Data**: Summary text, safety level (from backend)
   - "View details" button → Opens full dashboard view
   
   **Popup Structure**:
   ```javascript
   <Popup>
     <div className="housing-popup">
       <h4>{housing.address}</h4>
       <p className="price">{housing.price}</p>
       <p>{housing.bedrooms} bed, {housing.bathrooms} bath</p>
       <p className="neighborhood">{housing.neighborhood}</p>
       {housing.crime && (
         <div className="crime-stats">
           <strong>Safety:</strong> {housing.crime.safety_score}/10
           <br />{housing.crime.total_incidents} incidents
         </div>
       )}
       {housing.neighborhood_data && (
         <div className="neighborhood-info">
           {housing.neighborhood_data.summary}
         </div>
       )}
     </div>
   </Popup>
   ```

5. **Marker styling**
   - Color by property type or price range
   - Cluster markers if too many
   - Pulse animation for newly added markers

**New Map Layers**:
```javascript
// Housing markers as GeoJSON source
{
  type: 'FeatureCollection',
  features: housingResults.map(housing => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [housing.longitude, housing.latitude]
    },
    properties: {
      address: housing.address,
      bedrooms: housing.bedrooms,
      // ... other properties
    }
  }))
}
```

---

### Phase 3: Update App State Management

**File**: `frontend/src/App.jsx`

**Updates Needed**:
1. **Add housing results state**
   ```javascript
   const [housingResults, setHousingResults] = useState([]);
   const [selectedHousing, setSelectedHousing] = useState(null);
   ```

2. **Handle housing results from chatbot**
   ```javascript
   const handleHousingResults = (data) => {
     if (data.housing) {
       setHousingResults(data.housing);
       setDashboardData(data); // Update dashboard
       // Optionally: Fly map to show all markers
     }
   };
   ```

3. **Handle marker selection**
   ```javascript
   const handleHousingSelect = (housing) => {
     setSelectedHousing(housing);
     // Fly map to housing location
     // Update dashboard to highlight this property
   };
   ```

4. **Pass props to components**
   ```javascript
   <Map3D
     onNeighborhoodSelect={handleNeighborhoodSelect}
     housingResults={housingResults}  // NEW
     selectedHousing={selectedHousing}  // NEW
     onHousingSelect={handleHousingSelect}  // NEW
   />
   
   <Chatbot
     selectedNeighborhood={selectedNeighborhood}
     onNeighborhoodMention={handleNeighborhoodSelect}
     onHousingResults={handleHousingResults}  // NEW
   />
   ```

---

### Phase 4: Enhance Dashboard Component

**File**: `frontend/src/components/Dashboard.jsx`

**Updates Needed**:
1. **Make housing cards clickable**
   ```javascript
   <div 
     key={idx} 
     className="data-card"
     onClick={() => onHousingSelect && onHousingSelect(house)}
     style={{ cursor: 'pointer' }}
   >
   ```

2. **Highlight selected housing**
   - Add visual indicator for selected property
   - Show "View on map" option

3. **Display coordinates** (if needed)
   - Show lat/long in housing card
   - "Show on map" button

4. **Enhanced housing card display**
   ```javascript
   <div className="data-card">
     <p><strong>Address:</strong> {house.address}</p>
     <p><strong>Bedrooms:</strong> {house.bedrooms}</p>
     <p><strong>Bathrooms:</strong> {house.bathrooms}</p>
     <p><strong>Price:</strong> {house.price}</p>
     <p><strong>Units Available:</strong> {house.units}</p>
     {house.latitude && house.longitude && (
       <p className="coordinates">
         📍 {house.latitude.toFixed(4)}, {house.longitude.toFixed(4)}
       </p>
     )}
   </div>
   ```

**New Props**:
```javascript
<Dashboard
  neighborhood={selectedNeighborhood}
  data={dashboardData}
  selectedHousing={selectedHousing}  // NEW
  onHousingSelect={handleHousingSelect}  // NEW
/>
```

---

### Phase 5: Update API Service

**File**: `frontend/src/services/api.js`

**Updates Needed**:
1. **Add response parser helper**
   ```javascript
   export const parseChatResponse = (responseData) => {
     // Handle different response formats
     return {
       text: responseData.response || responseData.answer || '',
       housing: responseData.data?.housing || [],
       crime: responseData.data?.crime || {},
       summary: responseData.data?.summary || null,
       neighborhood: responseData.neighborhood || null
     };
   };
   ```

2. **Update chatAPI to parse response**
   ```javascript
   export const chatAPI = {
     sendMessage: async (message, context = {}) => {
       const response = await api.post('/api/chat', { message, context });
       return parseChatResponse(response.data);
     },
   };
   ```

---

## Implementation Checklist

### High Priority (Core Workflow)

- [ ] **Update Chatbot.jsx**
  - [ ] Extract `response.data.data.housing` from backend
  - [ ] Call `onHousingResults` callback with extracted data
  - [ ] Handle multiple response format variations

- [ ] **Update Map.jsx**
  - [ ] Accept `housingResults` prop
  - [ ] Create housing marker layer
  - [ ] Add marker click handler
  - [ ] **Enhanced popup showing**:
    - [ ] Price (from backend)
    - [ ] Address (from backend)
    - [ ] Crime statistics (from backend)
    - [ ] Neighborhood data/summary (from backend)
    - [ ] Property details (bedrooms, bathrooms, type)
  - [ ] Style markers (different colors/types)
  - [ ] Popup styling for comprehensive information display

- [ ] **Update App.jsx**
  - [ ] Add `housingResults` state
  - [ ] Add `selectedHousing` state
  - [ ] Implement `handleHousingResults` function
  - [ ] Implement `handleHousingSelect` function
  - [ ] Pass props to Map and Chatbot

- [ ] **Update Dashboard.jsx**
  - [ ] Make housing cards clickable
  - [ ] Add `onHousingSelect` handler
  - [ ] Highlight selected housing
  - [ ] Show coordinates in cards

- [ ] **Update API Service**
  - [ ] Add `parseChatResponse` helper
  - [ ] Update `chatAPI.sendMessage` to use parser

### Medium Priority (Enhancements)

- [ ] **Map Enhancements**
  - [ ] Fly to housing location when selected
  - [ ] Fit map bounds to show all markers
  - [ ] Marker clustering for many results
  - [ ] Different marker icons by property type

- [ ] **Dashboard Enhancements**
  - [ ] "Show on map" button in housing cards
  - [ ] Filter housing by property type
  - [ ] Sort by price, bedrooms, etc.
  - [ ] Crime chart visualization

- [ ] **UX Improvements**
  - [ ] Loading state for housing markers
  - [ ] Animation when markers appear
  - [ ] Clear markers button
  - [ ] "New search" to clear previous results

### Low Priority (Nice to Have)

- [ ] Route directions to housing location
- [ ] Share housing listing link
- [ ] Save favorites
- [ ] Export results

---

## Backend Response Format (Expected)

For Developer 3 reference, frontend expects:

```json
{
  "response": "I found 5 affordable 2-bedroom, 1-bathroom properties in Chicago...",
  "data": {
    "housing": [
      {
        "address": "123 Main St, Chicago, IL 60647",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "bedrooms": 2,
        "bathrooms": 1,
        "price": "$800/month",
        "units": 5,
        "property_type": "Apartment",
        "property_name": "Main Street Apartments",
        "neighborhood": "Logan Square",
        "community_area": 22,
        "phone": "(312) 555-1234",
        "crime": {
          "neighborhood": "Logan Square",
          "total_incidents": 45,
          "by_type": {
            "theft": 12,
            "assault": 3,
            "burglary": 8
          },
          "safety_score": 7.5,
          "trend": "decreasing"
        },
        "neighborhood_data": {
          "summary": "Logan Square is a vibrant neighborhood with moderate crime rates...",
          "safety_level": "moderate",
          "demographics": "...",
          "amenities": ["restaurants", "parks", "transit"]
        }
      }
    ],
    "crime": {
      "neighborhood": "Logan Square",
      "total_incidents": 45,
      "by_type": {
        "theft": 12,
        "assault": 3,
        "burglary": 8
      },
      "safety_score": 7.5,
      "trend": "decreasing"
    },
    "calls_311": [
      {
        "request_type": "Pothole Repair",
        "count": 15,
        "description": "Street maintenance requests"
      }
    ],
    "summary": {
      "text": "Logan Square is a vibrant neighborhood with moderate crime rates...",
      "safety_level": "moderate"
    }
  },
  "neighborhood": "Logan Square"
}
```

**IMPORTANT**: Each housing object in the array can have:
- `crime` object (crime stats for that property's neighborhood)
- `neighborhood_data` object (neighborhood summary and details)
- OR these can be shared at the top level `data.crime` and `data.summary` (frontend will merge them)

**Alternative format** (if backend uses different structure):
- Frontend will handle `response.data.answer` OR `response.data.response`
- Frontend will handle `response.data.housing` OR `response.data.data.housing`

---

## File Changes Summary

### Files to Update:
1. `frontend/src/App.jsx` - State management, handlers
2. `frontend/src/components/Chatbot.jsx` - Extract housing data from response
3. `frontend/src/components/Map.jsx` - Add housing markers layer
4. `frontend/src/components/Dashboard.jsx` - Make cards clickable
5. `frontend/src/services/api.js` - Add response parser

### New Features:
- Housing marker layer on map
- Address popup on marker click
- Housing selection from dashboard
- Map navigation to housing location
- Coordinate display

---

## Testing Plan

1. **Test Chatbot → Backend → Response**
   - Send query: "2 bed 1 bath affordable housing"
   - Verify response contains `data.housing` array
   - Verify housing objects have `latitude`, `longitude`, `address`

2. **Test Map Markers**
   - Verify markers appear at correct coordinates
   - Click marker → Verify popup shows address
   - Verify popup shows property details

3. **Test Dashboard Interaction**
   - Click housing card → Verify map flies to location
   - Verify marker is highlighted
   - Verify dashboard shows selected property details

4. **Test Full Workflow**
   - User query → Backend response → Map markers → Dashboard update → All sync correctly

---

## Next Steps

1. ✅ Review completed
2. ⏳ Update Chatbot to extract housing data
3. ⏳ Add housing markers to Map
4. ⏳ Update App state management
5. ⏳ Enhance Dashboard interactivity
6. ⏳ Test end-to-end workflow
7. ⏳ Coordinate with Developer 3 on response format

