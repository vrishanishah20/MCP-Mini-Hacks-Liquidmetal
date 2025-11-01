# Backend Changes Required for Dashboard Integration

## Overview

The deployed backend at `https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run` currently returns:

```json
{
  "message": "AI-generated text...",
  "sessionId": "01k90q4j1smfns68srpfqnpnpr",
  "citations": []
}
```

**It needs to include structured data** so the frontend dashboard can display housing, crime, and 311 information.

---

## Required Change: Add `data` Field to Response

### Current Response (What Backend Returns Now)
```json
{
  "message": "Chicago's housing market offers diverse options...",
  "sessionId": "01k90q4j1smfns68srpfqnpnpr",
  "citations": []
}
```

### Required Response (What Backend Should Return)
```json
{
  "message": "Chicago's housing market offers diverse options...",
  "sessionId": "01k90q4j1smfns68srpfqnpnpr",
  "citations": [],
  "data": {
    "housing": [
      {
        "address": "2401 N Milwaukee Ave, Chicago, IL",
        "price": "$350,000",
        "bedrooms": 2,
        "bathrooms": 1,
        "property_type": "Apartment",
        "units": 24,
        "latitude": 41.9246,
        "longitude": -87.7041
      }
    ],
    "crime": {
      "safety_score": 7,
      "total_incidents": 145,
      "trend": "decreasing",
      "by_type": {
        "Theft": 45,
        "Battery": 30,
        "Criminal Damage": 25,
        "Burglary": 15
      }
    },
    "calls_311": [
      {
        "request_type": "Pothole",
        "description": "Large pothole on main street"
      }
    ],
    "summary": {
      "text": "Logan Square is a vibrant neighborhood...",
      "safety_level": "Moderate"
    }
  }
}
```

---

## Implementation Steps

### Step 1: Modify Chat Orchestrator

**File:** `chatbot-frontend` service (the deployed backend)

**Location:** Wherever the `/api/chat` endpoint is handled

**Current Code (Approximate):**
```typescript
// After LLM generates response
return {
  message: aiResponse,
  sessionId: sessionId,
  citations: []
};
```

**Modified Code:**
```typescript
// After LLM generates response AND after SmartBucket searches
const bucketResults = {
  housing: housingBucketResults,  // From SmartBucket search
  crime: crimeBucketResults,      // From SmartBucket search
  services: serviceBucketResults  // From SmartBucket search
};

return {
  message: aiResponse,
  sessionId: sessionId,
  citations: [],

  // ADD THIS:
  data: formatDataForDashboard(bucketResults, userMessage)
};
```

---

### Step 2: Create Data Formatting Function

Add a helper function to structure the data:

```typescript
function formatDataForDashboard(bucketResults: any, userMessage: string) {
  return {
    // Format housing data
    housing: (bucketResults.housing || []).map((item: any) => ({
      address: item.address || item.location,
      price: item.price || formatPrice(item.rent),
      bedrooms: item.bedrooms || item.beds,
      bathrooms: item.bathrooms || item.baths,
      property_type: item.property_type || item.type,
      units: item.units || item.number_of_units,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude)
    })),

    // Format crime data
    crime: {
      safety_score: calculateSafetyScore(bucketResults.crime || []),
      total_incidents: (bucketResults.crime || []).length,
      trend: analyzeTrend(bucketResults.crime || []),
      by_type: groupCrimeByType(bucketResults.crime || [])
    },

    // Format 311 calls
    calls_311: (bucketResults.services || []).map((call: any) => ({
      request_type: call.sr_type || call.request_type,
      description: call.sr_short_code || call.description
    })),

    // Add summary
    summary: {
      text: extractSummaryFromAI(aiResponse),
      safety_level: getSafetyLevel(bucketResults.crime || [])
    }
  };
}
```

---

### Step 3: Helper Functions

```typescript
function calculateSafetyScore(crimeData: any[]): number {
  // Calculate based on crime incidents
  const incidents = crimeData.length;
  if (incidents < 50) return 9;
  if (incidents < 100) return 7;
  if (incidents < 200) return 5;
  return 3;
}

function analyzeTrend(crimeData: any[]): string {
  // Analyze crime trend from data
  return "stable"; // Placeholder - implement actual logic
}

function groupCrimeByType(crimeData: any[]): Record<string, number> {
  const grouped: Record<string, number> = {};

  crimeData.forEach(crime => {
    const type = crime.primary_type || crime.type;
    grouped[type] = (grouped[type] || 0) + 1;
  });

  return grouped;
}

function getSafetyLevel(crimeData: any[]): string {
  const score = calculateSafetyScore(crimeData);
  if (score >= 8) return "High";
  if (score >= 5) return "Moderate";
  return "Low";
}

function extractSummaryFromAI(aiResponse: string): string {
  // Extract first 2-3 sentences from AI response
  const sentences = aiResponse.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 2).join(' ');
}

function formatPrice(rent: number): string {
  return `$${rent.toLocaleString()}`;
}
```

---

## Where to Make Changes

The backend is deployed as a **LiquidMetal service**. You need to:

1. **Find the source code** for the `chatbot-frontend` service
2. **Locate the `/api/chat` endpoint handler**
3. **Add the `data` field** to the response after SmartBucket searches complete
4. **Redeploy the service** using LiquidMetal CLI

---

## Quick Test After Changes

Once backend is updated, test with:

```bash
curl -X POST https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me affordable housing in Logan Square"}'
```

**Expected response should now include:**
```json
{
  "message": "...",
  "sessionId": "...",
  "citations": [],
  "data": {         // ← NEW!
    "housing": [...],
    "crime": {...},
    "calls_311": [...],
    "summary": {...}
  }
}
```

---

## Frontend Already Supports This!

The frontend is **already configured** to receive and display this data:

✅ **Chatbot.jsx** (line 62-63): Looks for `response.data`
✅ **App.jsx** (line 43-63): Passes data to Dashboard
✅ **Dashboard.jsx**: Displays housing, crime, 311, and summary

**No frontend changes needed** - just update the backend response format!

---

## Summary

**Single Change Required:**

Add a `data` field to the `/api/chat` endpoint response that contains structured housing, crime, 311, and summary information extracted from SmartBucket search results.

**Impact:**

Once this change is deployed, the dashboard will automatically populate with:
- Housing cards with addresses, prices, bed/bath info
- Crime statistics with safety scores and incident breakdowns
- 311 service call summaries
- Neighborhood summaries

**Frontend is ready** - just waiting for backend to provide the data! 🚀
