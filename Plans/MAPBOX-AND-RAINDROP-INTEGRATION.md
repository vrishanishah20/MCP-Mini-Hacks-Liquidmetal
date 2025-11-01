# Mapbox & Raindrop MCP Integration Guide

## Mapbox Support for Coordinates & Addresses

### ✅ Current Implementation

**Latitude/Longitude Support:**
- ✅ Map uses coordinates: `longitude: -87.6298, latitude: 41.8781` (Chicago center)
- ✅ Click events return `event.lngLat.lng` and `event.lngLat.lat`
- ✅ Popups positioned using coordinates
- ✅ Map navigation uses coordinate-based viewState

**Address Support:**
- ⏳ **Not yet implemented** - Can be added using Mapbox Geocoding API

### Mapbox Geocoding API

Mapbox provides two APIs:

1. **Forward Geocoding** (Address → Coordinates)
   ```
   GET https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json
   Query params: access_token, proximity (Chicago), country (US)
   Returns: coordinates [longitude, latitude], place name, context
   ```

2. **Reverse Geocoding** (Coordinates → Address)
   ```
   GET https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json
   Returns: formatted address, place name, neighborhood info
   ```

### Adding Address Search Feature

**Implementation Plan:**

1. **Add Search Input Component**
   - Address search bar above/beside the map
   - Autocomplete suggestions as user types
   - Display search results with address and coordinates

2. **Geocoding Service**
   - Create `frontend/src/services/geocoding.js`
   - Use Mapbox Geocoding API
   - Handle Chicago-specific searches (limit to US, proximity to Chicago)

3. **Map Integration**
   - When address is selected → Fly to coordinates
   - Display marker at searched location
   - Show address in popup
   - Trigger neighborhood selection if within a neighborhood boundary

4. **UI Components Needed**
   - Search input with autocomplete dropdown
   - Search results list
   - "Use this location" button
   - Clear search button

**Example API Call:**
```javascript
const searchAddress = async (query) => {
  const token = process.env.REACT_APP_MAPBOX_TOKEN;
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
    `access_token=${token}&` +
    `proximity=-87.6298,41.8781&` +
    `country=US&` +
    `limit=5`
  );
  const data = await response.json();
  return data.features; // Array of matching locations
};
```

---

## Raindrop MCP Integration with Cursor

### What is MCP (Model Context Protocol)?

MCP is a protocol that allows AI assistants (like Cursor) to connect to external services and tools. Raindrop provides MCP servers that expose:
- **Tools**: Functions AI can call (chunk_search, put-object, etc.)
- **Resources**: Data sources AI can read (GeoJSON, datasets)
- **Prompts**: Reusable templates

### Setting Up Raindrop MCP in Cursor

#### Step 1: Configure Cursor MCP Settings

1. Open Cursor Settings
   - File → Preferences → Settings (or `Ctrl+,`)
   - Search for "MCP" or "Model Context Protocol"

2. Add Raindrop MCP Server

   **Option A: Via Cursor Settings UI**
   - Look for "MCP Servers" section
   - Click "Add Server"
   - Enter configuration:

   ```json
   {
     "raindrop-mcp": {
       "command": "npx",
       "args": ["-y", "@raindrop/mcp-server"],
       "env": {
         "RAINDROP_API_KEY": "your-raindrop-api-key",
         "RAINDROP_BASE_URL": "https://api.raindrop.io" // or your custom URL
       }
     }
   }
   ```

   **Option B: Via Config File**
   - Edit `~/.cursor/mcp.json` (or Windows: `%APPDATA%\Cursor\mcp.json`)
   - Add the same JSON configuration

#### Step 2: Verify Connection

1. Restart Cursor
2. Check MCP status in Cursor:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Look for "MCP" commands
   - Verify Raindrop server is connected

#### Step 3: Use Raindrop MCP Tools in Cursor

Once configured, you can use Raindrop tools in Cursor:

**Example: Search Chicago Data**
```
Ask Cursor: "Use Raindrop MCP to search for affordable housing in Logan Square"

Cursor will use: mcp__raindrop-mcp__chunk-search
  - bucket: "chicago-housing-data"
  - query: "affordable housing Logan Square"
```

**Example: Store Data**
```
Ask Cursor: "Save this neighborhood data to Raindrop"

Cursor will use: mcp__raindrop-mcp__put-object
  - bucket: "chicago-neighborhood-profiles"
  - data: { neighborhood: "Logan Square", ... }
```

### Available Raindrop MCP Tools

Based on the project plan, these tools are available:

**SmartBucket Management:**
- `mcp__raindrop-mcp__create-smartbucket` - Create data buckets
- `mcp__raindrop-mcp__put-object` - Upload/index data
- `mcp__raindrop-mcp__get-object` - Retrieve data
- `mcp__raindrop-mcp__list-objects` - List bucket contents

**Search & Query:**
- `mcp__raindrop-mcp__chunk-search` - Semantic search (PRIMARY for this project)
- `mcp__raindrop-mcp__document-search` - Find whole documents
- `mcp__raindrop-mcp__document-query` - Ask questions about docs
- `mcp__raindrop-mcp__sql-execute-query` - Structured SQL queries

**Memory (Conversation Context):**
- `mcp__raindrop-mcp__put-memory` - Store conversation history
- `mcp__raindrop-mcp__get-memory` - Retrieve history
- `mcp__raindrop-mcp__search-memory` - Search past conversations

### Integration with Current Project

**How This Helps Developer 2 (Frontend):**

1. **Dynamic GeoJSON Loading**
   - Use `mcp__raindrop-mcp__get-object` to fetch neighborhood boundaries
   - Store GeoJSON in Raindrop bucket: "chicago-neighborhood-geojson"

2. **Neighborhood Data Enrichment**
   - Use `mcp__raindrop-mcp__chunk-search` to get housing/crime data
   - Populate dashboard with Raindrop search results

3. **Address-to-Neighborhood Mapping**
   - Geocode address → Get coordinates
   - Use Raindrop to find which neighborhood contains those coordinates
   - Display neighborhood data from Raindrop

**How This Helps Developer 3 (Backend):**

1. **Backend API Can Use Raindrop MCP**
   - Configure Raindrop MCP in backend environment
   - Use MCP tools directly in Python/Node.js backend
   - Query Raindrop buckets via MCP instead of direct API

### Alternative: Direct API Integration

If MCP setup is complex, you can use Raindrop REST API directly:

```javascript
// Example: Direct API call (alternative to MCP)
const searchRaindrop = async (query) => {
  const response = await fetch('https://api.raindrop.io/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RAINDROP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      buckets: ['chicago-housing-data', 'chicago-crime-data']
    })
  });
  return response.json();
};
```

### Recommended Setup

For this project, we recommend:

1. **Backend Uses Raindrop API Directly** (simpler, more control)
2. **Cursor Uses Raindrop MCP** (for AI-assisted development)
3. **Frontend Calls Backend API** (standard REST architecture)

This keeps concerns separated:
- Cursor/AI → Uses MCP for development assistance
- Backend → Uses direct API for production
- Frontend → Uses backend REST endpoints

---

## Next Steps

### Immediate Actions:

1. **Add Address Search to Map** (if needed)
   - Implement geocoding service
   - Add search input UI
   - Integrate with neighborhood selection

2. **Set Up Raindrop MCP in Cursor** (for development)
   - Configure MCP server
   - Test connection
   - Document usage for team

3. **Verify Mapbox Geocoding Works**
   - Test with Chicago addresses
   - Verify coordinate conversion
   - Test reverse geocoding

### Files to Create/Update:

- `frontend/src/services/geocoding.js` - Mapbox geocoding service (if adding address search)
- `frontend/src/components/AddressSearch.jsx` - Address search component (if adding)
- `.cursor/mcp.json` - Cursor MCP configuration (user-specific)

---

## Summary

✅ **Mapbox Coordinates**: Fully supported - already working  
⏳ **Mapbox Addresses**: Can be added via Geocoding API  
✅ **Raindrop MCP**: Can be integrated into Cursor for AI-assisted development  

**Current Status:**
- Map uses lat/lng coordinates ✅
- Map clicks return coordinates ✅
- Address search not yet implemented (can add)
- Raindrop MCP not yet configured in Cursor (can set up)

