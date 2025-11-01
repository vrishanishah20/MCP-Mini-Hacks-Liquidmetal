# 2-Hour Raindrop + Claude Code Implementation Plan
## Chicago Real Estate Chatbot - 3-Person Team

**Development Method:** Raindrop MCP + Claude Code
**Team Size:** 3 developers
**Timeline:** 2 hours
**Assumption:** Raindrop authentication & basic setup complete

---

## Team Roles & Raindrop MCP Focus

### 👤 Developer 1: Data Ingestion & SmartBucket Lead
**Tools:** Raindrop SmartBucket, Chicago Data APIs, Claude Code
**Goal:** Get Chicago data indexed and searchable

### 👤 Developer 2: Frontend & UI Lead
**Tools:** Raindrop deployment, Claude Code for React/Next.js
**Goal:** Build chatbot interface and interactive map

### 👤 Developer 3: LLM Integration & Orchestration Lead
**Tools:** Raindrop chunk_search, SmartSQL, Claude Code
**Goal:** Connect LLM to Raindrop data for intelligent responses

---

## Hour 1: Parallel Foundation (0-60 minutes)

### Developer 1: SmartBucket Data Pipeline (60 min)

**0-15 min: Create SmartBuckets**
```bash
# Using Raindrop MCP tools via Claude Code
Action: Create 3 SmartBuckets for different data types
```

**MCP Commands:**
```
1. Create SmartBucket: "chicago-housing-data"
   - mcp__raindrop-mcp__create-smartbucket
   - bucket_name: "chicago-housing-data"
   - description: "Affordable rental housing data for Chicago neighborhoods"

2. Create SmartBucket: "chicago-crime-data"
   - bucket_name: "chicago-crime-data"
   - description: "Crime statistics by community area"

3. Create SmartBucket: "chicago-services-data"
   - bucket_name: "chicago-services-data"
   - description: "311 service requests and neighborhood infrastructure"
```

**15-30 min: Fetch & Upload Chicago Data**
```javascript
// Ask Claude Code to create this script
// File: scripts/fetch-chicago-data.js

// 1. Fetch affordable housing
GET https://data.cityofchicago.org/resource/s6ha-ppgi.json?$limit=1000

// 2. Fetch crime data (last 6 months)
GET https://data.cityofchicago.org/resource/6zsd-86xi.json?$where=date>'2024-05-01'&$limit=5000

// 3. Fetch 311 calls
GET https://data.cityofchicago.org/resource/v6vf-nfxy.json?$limit=3000
```

**Upload to SmartBuckets:**
```
Use: mcp__raindrop-mcp__put-object
- For each dataset: upload JSON to respective bucket
- Raindrop auto-indexes on upload
```

**30-45 min: Create Neighborhood Profiles**
```
Action: Process data into neighborhood summaries
Tool: Claude Code to aggregate by community_area

For each of ~10 key neighborhoods, create:
{
  "neighborhood": "Logan Square",
  "community_area": 32,
  "housing": { count, avg_units, properties: [] },
  "crime": { total, types: {}, recent_incidents: [] },
  "services": { total_311, top_issues: [] }
}

Upload: mcp__raindrop-mcp__put-object
Bucket: "chicago-neighborhood-profiles"
```

**45-60 min: Test SmartBucket Search**
```
Use: mcp__raindrop-mcp__chunk-search
Test queries:
- "affordable housing in Logan Square"
- "crime rates in community area 32"
- "311 service requests for potholes"

Verify: Results return relevant chunks
```

**Deliverables:**
- ✅ 3-4 SmartBuckets with Chicago data indexed
- ✅ ~10 neighborhood profile documents
- ✅ Working chunk_search queries

---

### Developer 2: Frontend UI (60 min)

**0-20 min: Initialize React App with Claude Code**
```
Prompt Claude Code:
"Create a React app (Vite) with:
- Chatbot component (message bubbles, input field)
- Simple Chicago map component (can use Leaflet or static image with clickable areas)
- Dashboard layout to show neighborhood info
- Tailwind CSS for styling"

File structure:
/frontend
  /src
    /components
      Chatbot.jsx
      Map.jsx
      Dashboard.jsx
    App.jsx
  package.json
```

**20-40 min: Build Chatbot Interface**
```
Prompt Claude Code:
"In Chatbot.jsx:
- Create chat UI with message history
- Initial message: 'Which Chicago area are you interested in?'
- Quick-reply buttons for 5 neighborhoods:
  * Logan Square
  * Wicker Park
  * Lincoln Park
  * Hyde Park
  * Pilsen
- Input field for free-form questions
- Display loading state while fetching responses"
```

**40-55 min: Create Interactive Map**
```
Prompt Claude Code:
"In Map.jsx:
- Use Leaflet with Chicago base map
- Load community area GeoJSON boundaries (or simplified polygon for 5 neighborhoods)
- Make neighborhoods clickable
- On click: trigger chatbot with 'Tell me about [neighborhood]'
- Highlight selected neighborhood
- Show tooltip on hover with neighborhood name"

Simplified approach if time is tight:
- Use static Chicago map image
- Overlay clickable divs for 5 neighborhoods
```

**55-60 min: Basic Dashboard Layout**
```
Prompt Claude Code:
"In Dashboard.jsx:
- Left side: Map component
- Right side: Chatbot component
- Bottom: Data summary cards (housing count, crime stats, 311 calls)
- Responsive layout (works on desktop)"
```

**Deliverables:**
- ✅ React app running on localhost
- ✅ Clickable map (5 neighborhoods minimum)
- ✅ Chat interface with quick replies
- ✅ Basic layout structure

---

### Developer 3: LLM + Raindrop Integration (60 min)

**0-15 min: Set Up Backend API Structure**
```
Prompt Claude Code:
"Create a simple Express.js backend with:
- /api/chat endpoint (POST)
- /api/neighborhood/:name endpoint (GET)
- CORS enabled for localhost:5173 (Vite default)
- Environment variables for API keys"

File: backend/server.js
```

**15-35 min: Raindrop Search Integration**
```javascript
// Prompt Claude Code to create:
// File: backend/services/raindrop.js

const searchChicagoData = async (query, neighborhood) => {
  // Use mcp__raindrop-mcp__chunk-search
  const response = await raindrop.chunkSearch({
    bucketLocations: [
      { bucket: { name: 'chicago-housing-data' } },
      { bucket: { name: 'chicago-crime-data' } },
      { bucket: { name: 'chicago-neighborhood-profiles' } }
    ],
    input: `${neighborhood}: ${query}`,
    requestId: `query-${Date.now()}`
  });

  return response.results.slice(0, 5); // Top 5 chunks
};
```

**35-50 min: LLM Response Generation**
```javascript
// File: backend/services/llm.js

const generateResponse = async (userQuery, raindropContext) => {
  const prompt = `You are a Chicago real estate assistant.

User Question: ${userQuery}

Relevant Data from Chicago databases:
${raindropContext.map(chunk => chunk.text).join('\n\n')}

Provide a helpful, specific answer with:
1. Direct answer to the question
2. Specific data points (numbers, addresses)
3. Brief analysis or recommendation

Keep response conversational and under 200 words.`;

  // Call Claude API or use mcp__zen__chat
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
};
```

**50-60 min: Create Chat Endpoint**
```javascript
// File: backend/routes/chat.js

router.post('/api/chat', async (req, res) => {
  const { message, neighborhood } = req.body;

  try {
    // 1. Search Raindrop for relevant context
    const context = await searchChicagoData(message, neighborhood);

    // 2. Generate LLM response
    const answer = await generateResponse(message, context);

    // 3. Return formatted response
    res.json({
      answer,
      sources: context.map(c => ({
        text: c.text.substring(0, 100),
        score: c.score
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Deliverables:**
- ✅ Backend API running on localhost:3001
- ✅ /api/chat endpoint working
- ✅ Raindrop chunk_search integrated
- ✅ LLM generating responses

---

## Hour 2: Integration & Deployment (60-120 minutes)

### Developer 1: SmartSQL & Advanced Queries (60 min)

**60-75 min: Set Up SmartSQL (Optional but Powerful)**
```
Use: mcp__raindrop-mcp__sql-execute-query

Create structured queries for:
1. "Get all housing in price range"
2. "Count crimes by type in neighborhood"
3. "Top 5 311 issues by area"

Example:
database_id: "chicago-housing-db"
query: "SELECT * FROM housing WHERE community_area = 32 AND units > 10"
```

**75-90 min: Enhance Data Aggregations**
```
Prompt Claude Code:
"Create aggregation functions that:
- Calculate average housing units per neighborhood
- Count crime incidents by category
- Identify top 311 service request types
- Generate neighborhood safety scores

Store results back in SmartBucket as enriched profiles"
```

**90-105 min: Real-time Data Updates (If Time)**
```
Set up scheduled job (or skip for MVP):
- Fetch latest crime data (updated daily)
- Upload incremental updates to SmartBucket
- Raindrop re-indexes automatically

OR: Document manual refresh process for demo
```

**105-120 min: Documentation & Support**
```
Create:
- README.md with Raindrop bucket names
- List of sample queries that work well
- Known limitations
- Help Dev 2 & 3 with integration issues
```

---

### Developer 2: Frontend Polish & Deployment (60 min)

**60-80 min: Connect Frontend to Backend**
```javascript
// Prompt Claude Code to update Chatbot.jsx

const sendMessage = async (message, neighborhood) => {
  setLoading(true);

  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, neighborhood })
  });

  const data = await response.json();

  setMessages([...messages,
    { role: 'user', content: message },
    { role: 'assistant', content: data.answer }
  ]);

  setLoading(false);
};
```

**80-95 min: Enhance UX**
```
Prompt Claude Code:
"Improve the UI with:
- Loading spinner while AI thinks
- Typing indicator animation
- Format LLM responses with markdown
- Add 'Data Sources' section showing Raindrop chunks used
- Quick action buttons: 'Show housing', 'Crime stats', 'Services'
- Error handling with friendly messages"
```

**95-110 min: Deploy to Netlify**
```
1. Build production frontend:
   npm run build

2. Deploy to Netlify:
   - Drag/drop 'dist' folder to Netlify
   - OR use CLI: netlify deploy --prod

3. Deploy backend as Netlify Functions:
   - Move backend routes to /netlify/functions/
   - Update API calls to /.netlify/functions/chat

4. Set environment variables in Netlify:
   - ANTHROPIC_API_KEY
   - RAINDROP_API_KEY (if needed)
```

**110-120 min: Final Testing**
```
Test scenarios:
1. Click Logan Square on map → Chat opens with context
2. Ask "Tell me about housing" → Get specific listings
3. Ask "Is it safe?" → Get crime statistics
4. Ask "What are common issues?" → Get 311 data
5. Test on mobile browser
```

---

### Developer 3: Advanced LLM Features (60 min)

**60-75 min: Memory & Context Management**
```
Use: mcp__raindrop-mcp__put-memory / get-memory

Store conversation history:
- session_id: user's chat session
- Store each user query + assistant response
- Retrieve last 3 exchanges for context

Code:
await raindrop.putMemory({
  session_id: sessionId,
  content: JSON.stringify({ user: message, assistant: response }),
  key: 'chat_history'
});
```

**75-90 min: Multi-Step Reasoning**
```
Enhance LLM prompt to handle complex queries:

"User asks: 'Find me affordable 2-bedroom apartments in safe areas'

Steps:
1. Search housing data: 2+ bedroom units
2. Search crime data: low crime neighborhoods
3. Intersect results
4. Format as recommendation list"

Use multiple Raindrop chunk_search calls:
- One for housing filter
- One for crime stats
- Combine in prompt
```

**90-105 min: Add Data Citations**
```
Prompt Claude Code:
"Update LLM response to include footnotes:

Example output:
'Logan Square has 15 affordable housing options [1], with
moderate crime levels averaging 45 incidents per month [2].
The most common 311 requests are for pothole repairs [3].'

Sources:
[1] Chicago Affordable Housing Database
[2] Chicago Crime Statistics (Oct 2024)
[3] 311 Service Requests
```

**105-115 min: Testing & Optimization**
```
Test query performance:
- Measure chunk_search response time
- Optimize bucket selection (only search relevant buckets)
- Cache frequent queries in Raindrop memory
- Test edge cases: empty results, invalid neighborhoods
```

**115-120 min: Demo Preparation**
```
Create demo script:
1. Show map click → Chat engagement
2. Ask: "What housing is available in Pilsen?"
3. Follow-up: "How safe is it?"
4. Follow-up: "What about schools?" (show graceful handling if no data)
5. Highlight Raindrop data sources in UI
```

---

## Integration Checkpoints

### 30-Min Sync (All Devs)
**Share:**
- Dev 1: SmartBucket names and sample chunk_search results
- Dev 2: Frontend localhost URL
- Dev 3: Backend API localhost URL

**Test:**
- Make one API call from frontend to backend
- Verify CORS working
- Confirm data flowing

---

### 60-Min Integration (All Devs)
**Actions:**
1. Dev 2: Update frontend to call Dev 3's backend
2. Dev 3: Ensure backend queries Dev 1's SmartBuckets
3. Test end-to-end: Map click → API call → Raindrop search → LLM response → Display

**Fix:**
- CORS issues
- API endpoint mismatches
- Missing environment variables

---

### 90-Min Polish (All Devs)
**Focus:**
1. Deploy backend to Netlify Functions (or Vercel)
2. Deploy frontend to Netlify
3. Update API URLs to production
4. Test live deployment
5. Fix any production-only issues

---

## Raindrop MCP Tools Reference

### Core Tools to Use:

**SmartBucket Management:**
```
mcp__raindrop-mcp__create-smartbucket
mcp__raindrop-mcp__put-object
mcp__raindrop-mcp__get-object
mcp__raindrop-mcp__list-objects
```

**Search & Query:**
```
mcp__raindrop-mcp__document-search (find whole documents)
mcp__raindrop-mcp__chunk-search (find relevant text chunks - PRIMARY)
mcp__raindrop-mcp__document-query (ask questions about specific doc)
```

**Memory (Conversation Context):**
```
mcp__raindrop-mcp__put-memory
mcp__raindrop-mcp__get-memory
mcp__raindrop-mcp__search-memory
```

**SmartSQL (Structured Queries):**
```
mcp__raindrop-mcp__sql-execute-query
mcp__raindrop-mcp__sql-get-metadata
```

**Session Management:**
```
mcp__raindrop-mcp__get-prompt (workflow orchestration)
mcp__raindrop-mcp__update-state (report progress)
```

---

## Claude Code Prompts Library

### For Developer 1 (Data):
```
"Fetch Chicago affordable housing data from
https://data.cityofchicago.org/resource/s6ha-ppgi.json
and upload to Raindrop SmartBucket 'chicago-housing-data'
using mcp__raindrop-mcp__put-object. Process the data to
extract key fields: property_name, address, community_area,
units, phone_number."
```

### For Developer 2 (Frontend):
```
"Create a React chatbot component with:
- Message bubbles (user on right, assistant on left)
- Input field with send button
- Quick-reply chips for Chicago neighborhoods
- Loading state with animated dots
- Markdown rendering for responses
- Mobile-responsive (Tailwind CSS)"
```

### For Developer 3 (Backend):
```
"Create an Express API endpoint /api/chat that:
1. Receives { message, neighborhood } in request body
2. Calls mcp__raindrop-mcp__chunk-search on chicago-housing-data bucket
3. Uses retrieved chunks as context for Claude LLM
4. Returns { answer, sources } as JSON
Include error handling and CORS."
```

---

## Emergency Shortcuts (If Behind Schedule)

**If SmartBucket indexing is slow:**
- Use pre-prepared JSON files with sample data
- Upload smaller datasets (100 records instead of 1000)
- Focus on 3 neighborhoods instead of all 77

**If Frontend is complex:**
- Skip map, use dropdown or buttons for neighborhood selection
- Use simpler chat UI (no markdown, just plain text)
- Deploy frontend only (backend on localhost for demo)

**If LLM integration struggles:**
- Use template-based responses with placeholders
- Show raw Raindrop search results instead of generated text
- Demonstrate the data pipeline without LLM layer

---

## Success Demo Script (2-Hour Deliverable)

**Scenario:** User looking for housing in Chicago

1. **Open app** → See Chicago map with clickable neighborhoods
2. **Click "Logan Square"** → Chatbot activates
3. **Chatbot asks:** "What would you like to know about Logan Square?"
4. **User types:** "Show me affordable housing options"
5. **Behind the scenes:**
   - Frontend sends to /api/chat
   - Backend queries Raindrop SmartBucket
   - Retrieves housing data chunks
   - LLM generates response
6. **Chatbot responds:** "Logan Square has 12 affordable housing properties. The largest is Erie House with 50 units at 1347 W. Erie St..."
7. **User asks:** "How safe is the area?"
8. **Chatbot responds:** "Based on recent crime data, Logan Square averaged 45 incidents per month in 2024..."
9. **Show data sources:** Display which Raindrop buckets were queried

**Demo Highlights:**
- ✅ Real Chicago data (not mocked)
- ✅ Raindrop SmartBucket powering search
- ✅ LLM generating natural responses
- ✅ Interactive map
- ✅ Multi-turn conversation
- ✅ Live deployment URL

---

## Final Checklist (Before Demo)

**Developer 1:**
- [ ] At least 3 SmartBuckets created and populated
- [ ] Sample chunk_search queries returning results
- [ ] Neighborhood profile documents uploaded
- [ ] Documentation of bucket names and data schema

**Developer 2:**
- [ ] Frontend deployed to Netlify (live URL)
- [ ] Map with 5+ clickable neighborhoods
- [ ] Chat interface working
- [ ] Mobile-responsive (basic)
- [ ] Connected to backend API

**Developer 3:**
- [ ] Backend API deployed (Netlify Functions or localhost)
- [ ] /api/chat endpoint functional
- [ ] Raindrop integration working
- [ ] LLM generating coherent responses
- [ ] Error handling in place

**All Together:**
- [ ] End-to-end test: map → chat → response
- [ ] At least 3 working demo queries prepared
- [ ] Known limitations documented
- [ ] GitHub repo with code (optional but nice)

---

## Post-Demo Enhancements (If Time Remains)

1. Add more neighborhoods (expand from 5 to 15)
2. Implement price range filters
3. Add school data (if API available)
4. Improve map visuals (color coding by crime rate)
5. Add "Save search" feature using Raindrop memory
6. Performance optimization (caching)
7. Better error messages
8. Loading state animations

---

**Total Realistic Scope for 2 Hours:**
- ✅ 5 neighborhoods clickable on map
- ✅ 3-4 SmartBuckets with Chicago data
- ✅ Working chat with LLM responses
- ✅ Basic deployment
- ✅ Demo-ready application

**Good luck! The Raindrop MCP tools will accelerate development significantly!** 🚀
