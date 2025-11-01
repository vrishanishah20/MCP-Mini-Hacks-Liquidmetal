// ABOUTME: Adapter to transform backend responses and add structured data for dashboard
// ABOUTME: This enriches AI text responses with mock data until backend returns structured data

/**
 * Generates mock housing data for demonstration
 */
const generateMockHousingData = (neighborhood) => {
  const mockAddresses = [
    '2401 N Milwaukee Ave', '1850 W Armitage Ave', '2500 N Clybourn Ave',
    '1920 W Division St', '2100 N California Ave'
  ];

  return mockAddresses.map((address, idx) => ({
    address: `${address}, Chicago, IL`,
    price: `$${(250000 + Math.random() * 200000).toFixed(0)}`,
    bedrooms: Math.floor(Math.random() * 3) + 1,
    bathrooms: Math.floor(Math.random() * 2) + 1,
    property_type: ['Apartment', 'Condo', 'Townhouse'][idx % 3],
    units: Math.floor(Math.random() * 50) + 10,
    latitude: 41.9 + (Math.random() * 0.1),
    longitude: -87.7 + (Math.random() * 0.1)
  }));
};

/**
 * Generates mock crime data for demonstration
 */
const generateMockCrimeData = () => ({
  safety_score: Math.floor(Math.random() * 3) + 6, // 6-8
  total_incidents: Math.floor(Math.random() * 200) + 100,
  trend: ['decreasing', 'stable', 'increasing'][Math.floor(Math.random() * 3)],
  by_type: {
    'Theft': Math.floor(Math.random() * 50) + 20,
    'Battery': Math.floor(Math.random() * 30) + 10,
    'Criminal Damage': Math.floor(Math.random() * 25) + 10,
    'Burglary': Math.floor(Math.random() * 20) + 5
  }
});

/**
 * Generates mock 311 call data for demonstration
 */
const generateMock311Data = () => {
  const callTypes = [
    { type: 'Pothole', desc: 'Large pothole reported on main street' },
    { type: 'Street Light Out', desc: 'Street light not working' },
    { type: 'Graffiti Removal', desc: 'Graffiti on building wall' },
    { type: 'Tree Trim', desc: 'Tree branches blocking sidewalk' },
    { type: 'Garbage Cart', desc: 'Damaged garbage cart needs replacement' }
  ];

  return callTypes.map(call => ({
    request_type: call.type,
    description: call.desc
  }));
};

/**
 * Extracts neighborhood name from user message
 */
const extractNeighborhood = (message) => {
  const neighborhoods = [
    'Logan Square', 'Wicker Park', 'Lincoln Park', 'Hyde Park',
    'Pilsen', 'Lakeview', 'River North', 'West Loop'
  ];

  const messageLower = message.toLowerCase();
  for (const hood of neighborhoods) {
    if (messageLower.includes(hood.toLowerCase())) {
      return hood;
    }
  }
  return null;
};

/**
 * Checks if message is about housing
 */
const isHousingQuery = (message) => {
  const keywords = ['housing', 'house', 'apartment', 'rent', 'buy', 'property', 'affordable', 'bedroom', 'bath'];
  const messageLower = message.toLowerCase();
  return keywords.some(keyword => messageLower.includes(keyword));
};

/**
 * Checks if message is about crime/safety
 */
const isCrimeQuery = (message) => {
  const keywords = ['crime', 'safe', 'safety', 'dangerous', 'police', 'incident'];
  const messageLower = message.toLowerCase();
  return keywords.some(keyword => messageLower.includes(keyword));
};

/**
 * Checks if message is about 311 services
 */
const is311Query = (message) => {
  const keywords = ['311', 'service', 'pothole', 'complaint', 'report'];
  const messageLower = message.toLowerCase();
  return keywords.some(keyword => messageLower.includes(keyword));
};

/**
 * Enriches backend response with structured data for dashboard
 *
 * @param {Object} backendResponse - Response from backend API
 * @param {string} userMessage - Original user message
 * @returns {Object} Enhanced response with structured data
 */
export const enrichResponse = (backendResponse, userMessage) => {
  // If backend already provides data, use it
  if (backendResponse.data && Object.keys(backendResponse.data).length > 0) {
    return backendResponse;
  }

  // Extract neighborhood from message
  const neighborhood = extractNeighborhood(userMessage);

  // Determine what data to include based on query
  const includeHousing = isHousingQuery(userMessage);
  const includeCrime = isCrimeQuery(userMessage);
  const include311 = is311Query(userMessage);

  // If no specific query detected, include all data types
  const includeAll = !includeHousing && !includeCrime && !include311;

  // Build structured data object
  const structuredData = {};

  if (includeHousing || includeAll) {
    structuredData.housing = generateMockHousingData(neighborhood);
  }

  if (includeCrime || includeAll) {
    structuredData.crime = generateMockCrimeData();
  }

  if (include311 || includeAll) {
    structuredData.calls_311 = generateMock311Data();
  }

  if (neighborhood) {
    structuredData.summary = {
      text: `${neighborhood} is a vibrant Chicago neighborhood with diverse housing options and community services.`,
      safety_level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)]
    };
  }

  // Return enhanced response
  return {
    ...backendResponse,
    data: Object.keys(structuredData).length > 0 ? structuredData : undefined,
    neighborhood: neighborhood
  };
};
