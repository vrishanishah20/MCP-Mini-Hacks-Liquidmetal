# Chicago Real Estate Chatbot - Integration Guide

## Backend URLs

### Production Backend (Deployed)
```
Base URL: https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run
```

### Available Endpoints

#### 1. Chat API (PRIMARY)
- **URL**: `POST /api/chat`
- **Full URL**: `https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run/api/chat`
- **Status**: ✅ Working
- **Purpose**: Main chatbot endpoint

**Request:**
```json
{
  "message": "Tell me about affordable housing in Logan Square"
}
```

**Optional with session:**
```json
{
  "message": "Tell me about affordable housing in Logan Square",
  "sessionId": "existing-session-id"
}
```

**Response:**
```json
{
  "message": "Chicago's housing market is diverse... [AI response]",
  "sessionId": "01k90q4j1smfns68srpfqnpnpr",
  "citations": []
}
```

#### 2. Health Check
- **URL**: `GET /health`
- **Full URL**: `https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run/health`

---

## Frontend Configuration

### Environment Variables

**File**: `frontend/.env`

```env
VITE_API_URL=https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoia2FtYWx3b2xseSIsImEiOiJjbWhncjB5dmMwZzhiMmxxMWhsNm5uYjk4In0.DMpO0k4m1MVN8VB_8Yj7cw
```

---

## Frontend Code Changes Needed

### 1. Update API Service

**File**: `frontend/src/services/api.js`

**Change request format from:**
```javascript
export const chatAPI = {
  sendMessage: async (message, context = {}) => {
    const response = await api.post('/api/chat', { message, context });
    return response.data;
  },
};
```

**To:**
```javascript
export const chatAPI = {
  sendMessage: async (message, sessionId = null) => {
    const payload = { message };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    const response = await api.post('/api/chat', payload);
    return response.data;
  },
};
```

### 2. Update Chatbot Component

**File**: `frontend/src/components/Chatbot.jsx`

**Store and use sessionId:**
```javascript
const [sessionId, setSessionId] = useState(null);

const sendMessage = async () => {
  // ... existing code ...

  try {
    const response = await chatAPI.sendMessage(inputValue, sessionId);

    // Store session ID from response
    if (response.sessionId) {
      setSessionId(response.sessionId);
    }

    const assistantMessage = {
      role: 'assistant',
      content: response.message
    };
    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Testing the Integration

### 1. Test Backend Directly
```bash
curl -X POST https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about housing in Chicago"}'
```

**Expected Response:**
- HTTP 200
- JSON with `message`, `sessionId`, and `citations` fields

### 2. Test Frontend
1. Start dev server: `npm start` (already running at http://localhost:3000)
2. Open browser: http://localhost:3000
3. Type a message: "Tell me about Logan Square"
4. Verify:
   - Request goes to backend URL
   - Response displays in chat
   - Session ID persists across messages

---

## Current Status

✅ **Backend**: Fully deployed and working
✅ **Environment Variables**: Configured correctly
✅ **API Endpoint**: Tested and returning responses
⚠️ **Frontend Integration**: Needs API service update (see above)
✅ **Frontend Dev Server**: Running at http://localhost:3000

---

## Backend Data Sources

The backend searches across 3 SmartBuckets:
1. **Housing Data**: 598 records from Chicago Data Portal
2. **Crime Data**: 1,000 records from Chicago Data Portal
3. **311 Services**: 1,000 service call records

**Search Categories Auto-Detected:**
- Keywords like "housing", "affordable" → searches housing-bucket
- Keywords like "crime", "rate", "safe" → searches crime-bucket
- Keywords like "311", "service" → searches services-bucket
- No keywords → searches all 3 buckets

---

## Architecture Overview

```
User → Frontend (localhost:3000)
        ↓
    Vite .env (VITE_API_URL)
        ↓
    API Service (api.js)
        ↓
    POST /api/chat
        ↓
Backend (chatbot-frontend service)
        ↓
    Chat Orchestrator (private service)
        ├→ SmartBucket Search (housing/crime/311)
        ├→ AI (Llama 3.3 70B)
        └→ SmartMemory (session management)
        ↓
    Response with AI-generated answer
```

---

## Troubleshooting

### Frontend can't connect to backend
- Check `.env` file has correct `VITE_API_URL`
- Restart dev server after changing `.env`
- Check browser console for CORS errors (backend has CORS enabled)

### Backend returns errors
- Check request format matches: `{message: "..."}` (no sessionId for first message)
- Verify Content-Type header is `application/json`

### Session not persisting
- Ensure you're storing `sessionId` from response
- Pass `sessionId` in subsequent requests
- Backend generates new session if no sessionId provided
