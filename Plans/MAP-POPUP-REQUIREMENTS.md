# Map Marker Popup Requirements

## When User Clicks on Housing Marker

### Required Information Display

When clicking a housing marker on the map, the popup MUST display:

1. **Price** ✅ (from backend)
   - Format: "$800/month" or "$950/month"
   - Display prominently

2. **Address** ✅ (from backend)
   - Full address: "123 Main St, Chicago, IL 60647"
   - Clickable (if link to external listing)

3. **Crime Statistics** ✅ (from backend)
   - Total incidents in neighborhood
   - Safety score (e.g., "7.5/10")
   - Crime trend (increasing/decreasing)
   - Top crime types

4. **Neighborhood Data** ✅ (from backend)
   - Neighborhood name
   - Neighborhood summary/description
   - Safety level (low/moderate/high)
   - Key amenities or features

5. **Property Details** ✅ (from backend)
   - Bedrooms (e.g., "2 bed")
   - Bathrooms (e.g., "1 bath")
   - Property type (Apartment, House, etc.)
   - Units available

## Popup Design

### Layout Structure

```
┌─────────────────────────────────────┐
│ 123 Main St, Chicago, IL 60647      │ ← Address (Header)
├─────────────────────────────────────┤
│ $800/month                          │ ← Price (Large, Prominent)
├─────────────────────────────────────┤
│ 2 bed, 1 bath • Apartment           │ ← Property Details
│ Logan Square                         │ ← Neighborhood
├─────────────────────────────────────┤
│ Safety Score: 7.5/10                │ ← Crime Stats Section
│ 45 incidents (trend: decreasing)    │
│ Top: Theft (12), Burglary (8)       │
├─────────────────────────────────────┤
│ Logan Square is a vibrant...        │ ← Neighborhood Summary
│ (moderate safety)                    │
├─────────────────────────────────────┤
│ [View Full Details]                 │ ← Action Button
└─────────────────────────────────────┘
```

### Visual Styling

- **Address**: Bold, larger font (header)
- **Price**: Large, highlighted (e.g., green or blue)
- **Crime Stats**: Icon (🛡️ or ⚠️) with color coding
  - Green: Safe (8-10)
  - Yellow: Moderate (5-7)
  - Red: High risk (<5)
- **Neighborhood Data**: Italic or smaller font
- **Action Button**: Primary button style

## Backend Data Structure

### Required Fields per Housing Object

```json
{
  "address": "string (required)",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "price": "string (required)",
  "bedrooms": "number",
  "bathrooms": "number",
  "property_type": "string",
  "neighborhood": "string",
  
  "crime": {
    "total_incidents": "number",
    "safety_score": "number (0-10)",
    "trend": "string (increasing/decreasing/stable)",
    "by_type": {
      "theft": "number",
      "assault": "number",
      "burglary": "number"
    }
  },
  
  "neighborhood_data": {
    "name": "string",
    "summary": "string",
    "safety_level": "string (low/moderate/high)",
    "amenities": ["array of strings"]
  }
}
```

### Alternative: Shared Data Structure

If crime/neighborhood data is the same for all properties in response:

```json
{
  "data": {
    "housing": [/* array of housing objects */],
    "crime": {/* shared crime stats */},
    "summary": {/* shared neighborhood summary */}
  }
}
```

Frontend will merge shared data with each housing object for popup display.

## Implementation Details

### Popup Component

```javascript
// In Map.jsx
const HousingPopup = ({ housing }) => {
  const crime = housing.crime || {};
  const neighborhood = housing.neighborhood_data || {};
  
  return (
    <Popup>
      <div className="housing-popup">
        <h4>{housing.address}</h4>
        <p className="price">{housing.price}</p>
        <p>{housing.bedrooms} bed, {housing.bathrooms} bath • {housing.property_type}</p>
        <p className="neighborhood">{housing.neighborhood}</p>
        
        {crime.safety_score && (
          <div className="crime-stats">
            <strong>🛡️ Safety: {crime.safety_score}/10</strong>
            <br />
            {crime.total_incidents} incidents
            {crime.trend && ` (${crime.trend})`}
          </div>
        )}
        
        {neighborhood.summary && (
          <div className="neighborhood-info">
            <p>{neighborhood.summary}</p>
            {neighborhood.safety_level && (
              <span className="safety-badge">{neighborhood.safety_level} safety</span>
            )}
          </div>
        )}
        
        <button onClick={() => handleViewDetails(housing)}>
          View Full Details
        </button>
      </div>
    </Popup>
  );
};
```

### CSS Styling

```css
.housing-popup {
  min-width: 250px;
  max-width: 350px;
}

.housing-popup h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.housing-popup .price {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 8px 0;
}

.housing-popup .neighborhood {
  color: #666;
  font-size: 14px;
}

.housing-popup .crime-stats {
  margin: 12px 0;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
}

.housing-popup .neighborhood-info {
  margin: 12px 0;
  font-size: 13px;
  color: #555;
  font-style: italic;
}

.safety-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: #e8f5e9;
  color: #2e7d32;
}
```

## User Flow

1. User asks chatbot: "2 bed 1 bath affordable housing"
2. Backend returns housing results with all data
3. Map displays markers at housing locations
4. User clicks marker → **Popup shows**:
   - Price ✅
   - Address ✅
   - Crime statistics ✅
   - Neighborhood data ✅
   - Property details ✅
5. User clicks "View Full Details" → Dashboard updates with full property info

## Testing Checklist

- [ ] Marker click opens popup
- [ ] Popup displays price
- [ ] Popup displays address
- [ ] Popup displays crime statistics
- [ ] Popup displays neighborhood data
- [ ] Popup displays property details
- [ ] All data comes from backend response
- [ ] Popup closes on outside click
- [ ] Popup styles correctly
- [ ] "View Full Details" button works

