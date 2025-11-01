# Chicago Real Estate Chatbot

An intelligent real estate chatbot that helps users explore Chicago neighborhoods with comprehensive data about affordable housing, crime stats, and local amenities.

## Features

- Interactive chatbot interface for natural conversation
- Clickable Chicago neighborhood map with hover details
- Real-time house price retrieval for specific addresses
- Comprehensive dashboard showing:
  - Affordable housing options
  - Crime statistics
  - 311 service call data
  - Nearby schools and restaurants
  - Safety information
- Powered by LLM for intelligent responses
- Data indexing with Raindrop MCP server

## Project Structure

```
.
├── frontend/                 # React chatbot interface
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Map.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── backend/                  # Python backend API
│   ├── api/                 # API endpoints
│   ├── data/                # Data processing
│   ├── mcp/                 # Raindrop MCP integration
│   ├── llm/                 # LLM integration
│   └── main.py
├── data/                    # Data storage
│   ├── raw/                 # Raw datasets
│   └── processed/           # Processed datasets
├── config/                  # Configuration files
├── tests/                   # Test suites
└── deployment/              # Netlify deployment config
```

## Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Data Sources

- **Affordable Housing**: City of Chicago affordable housing dataset
- **Crime Data**: Chicago crime statistics
- **311 Calls**: City service requests and infrastructure data

## Deployment

Deploy to Netlify:
```bash
npm run build
netlify deploy --prod
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- Chicago Data Portal API key
- Raindrop MCP server credentials
- LLM API keys (OpenAI/Anthropic)

## License

MIT
