# Chicago Real Estate Chatbot - Frontend

React frontend for the Chicago Real Estate Assistant chatbot application.

## Tech Stack

- React 18
- Vite
- Tailwind CSS

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Chatbot.jsx      # Chat interface with message bubbles
│   │   └── Map.jsx           # Placeholder map component
│   ├── services/
│   │   └── api.js            # API service for backend communication
│   ├── App.jsx               # Main application component
│   └── index.css             # Tailwind CSS imports
├── package.json
└── .env.example              # Environment variables template
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL (default is `http://localhost:8000`)

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

### Chatbot Component
- Interactive chat interface
- Message history display
- User/bot message differentiation
- Loading states
- Error handling

### Map Component
- Placeholder for future map integration
- Will display Chicago property locations
- Will show neighborhood boundaries

### API Service
- `sendChatMessage(message)` - Send chat queries to backend
- `fetchProperties(filters)` - Get property data
- `fetchNeighborhoods()` - Get neighborhood information
- `healthCheck()` - Check backend connectivity

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:8000)

## Next Steps

- Integrate real map library (e.g., Leaflet, Mapbox)
- Connect to backend API endpoints
- Add property visualization on map
- Implement advanced filtering
