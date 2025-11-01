# Real Estate Chatbot Plan

## Frontend
- A chatbot interface where users can ask and answer questions.
- First question: Which area are you interested in? 
- A clickable map of Chicago showing neighborhoods, with hover details presented in a dashboard format.

## Data Sources
- Main dataset: Affordable housing dataset from the City of Chicago portal.
- Additional datasets: Crime stats and 311 calls, for safety and infrastructure information.

## Functionality
- LLM retrieves specific house prices from the internet for the given address.
- Provides options for different house types (e.g., 1 bed, 2 bed).
- Combines all datasets to show comprehensive dashboard info for the area.
- LLM can answer further questions like nearby schools, restaurants, and safety.

## Backend and Tools
- Using Raindrop and MCP tools for data storage and indexing.
- Development with CloudCode.
- Deployment on Netlify.

## Additional Notes
- Indexing crime, 311, and other data to enrich the dashboard.
- Be mindful of data freshness and real-time updates.
- Ensure compliance with privacy regulations when displaying addresses.