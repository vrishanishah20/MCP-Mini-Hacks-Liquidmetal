/**
 * Script to fetch Chicago data from the Data Portal APIs
 * This will prepare data for upload to Raindrop SmartBuckets
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// API endpoints - using SODA API (more accessible than V3)
const HOUSING_API = 'https://data.cityofchicago.org/resource/s6ha-ppgi.json';
const CRIME_API = 'https://data.cityofchicago.org/resource/ijzp-q8t2.json';
const CALLS_311_API = 'https://data.cityofchicago.org/resource/v6vf-nfxy.json';

const OUTPUT_DIR = path.join(__dirname, '../data/raw');

/**
 * Fetch data from Chicago Data Portal
 */
async function fetchData(url, datasetName, limit = 1000) {
  console.log(`Fetching ${datasetName} data (limit: ${limit})...`);

  try {
    const response = await fetch(`${url}?$limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Fetched ${datasetName}: ${data.length} records, ${JSON.stringify(data).length} bytes`);

    return data;
  } catch (error) {
    console.error(`✗ Error fetching ${datasetName}:`, error.message);
    throw error;
  }
}

/**
 * Save data to file
 */
function saveData(data, filename) {
  const filepath = path.join(OUTPUT_DIR, filename);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✓ Saved to ${filepath}`);

  return filepath;
}

/**
 * Process and extract key fields from housing data
 * SODA API returns array of objects directly
 */
function processHousingData(rawData) {
  console.log('Processing housing data...');

  if (!Array.isArray(rawData)) {
    console.log('Warning: Unexpected data format');
    return rawData;
  }

  const processed = rawData.map(row => {
    return {
      property_name: row.property_name || row['Property Name'] || 'Unknown',
      address: row.address || row['Address'] || '',
      community_area: row.community_area || row['Community Area'] || '',
      community_area_name: row.community_area_name || row['Community Area Name'] || '',
      units: row.units || row['Units'] || 0,
      phone: row.phone_number || row['Phone'] || '',
      property_type: row.property_type || '',
      management_company: row.management_company || ''
    };
  });

  console.log(`✓ Processed ${processed.length} housing records`);
  return processed;
}

/**
 * Process crime data
 * SODA API returns array of objects directly
 */
function processCrimeData(rawData) {
  console.log('Processing crime data...');

  if (!Array.isArray(rawData)) {
    console.log('Warning: Unexpected data format');
    return rawData;
  }

  const processed = rawData.map(row => {
    return {
      date: row.date || row['Date'] || '',
      primary_type: row.primary_type || row['Primary Type'] || '',
      description: row.description || row['Description'] || '',
      location_description: row.location_description || '',
      arrest: row.arrest || false,
      domestic: row.domestic || false,
      community_area: row.community_area || '',
      year: row.year || '',
      block: row.block || ''
    };
  });

  console.log(`✓ Processed ${processed.length} crime records`);
  return processed;
}

/**
 * Process 311 calls data
 * SODA API returns array of objects directly
 */
function process311Data(rawData) {
  console.log('Processing 311 calls data...');

  if (!Array.isArray(rawData)) {
    console.log('Warning: Unexpected data format');
    return rawData;
  }

  const processed = rawData.map(row => {
    return {
      sr_number: row.sr_number || '',
      sr_type: row.sr_type || row['SR Type'] || '',
      sr_short_code: row.sr_short_code || '',
      created_date: row.created_date || '',
      status: row.status || '',
      community_area: row.community_area || '',
      street_address: row.street_address || '',
      zip_code: row.zip_code || ''
    };
  });

  console.log(`✓ Processed ${processed.length} 311 call records`);
  return processed;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Chicago Data Fetcher for Raindrop SmartBuckets');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch all datasets
    console.log('Step 1: Fetching data from Chicago Data Portal...');
    console.log('');

    // Fetch datasets one by one to handle errors better
    let housingData = null;
    let crimeData = null;
    let calls311Data = null;

    try {
      housingData = await fetchData(HOUSING_API, 'Housing', 1000);
    } catch (error) {
      console.error('Warning: Could not fetch housing data:', error.message);
    }

    try {
      crimeData = await fetchData(CRIME_API, 'Crime', 1000);
    } catch (error) {
      console.error('Warning: Could not fetch crime data:', error.message);
    }

    try {
      calls311Data = await fetchData(CALLS_311_API, '311 Calls', 1000);
    } catch (error) {
      console.error('Warning: Could not fetch 311 data:', error.message);
    }

    if (!housingData && !crimeData && !calls311Data) {
      throw new Error('Failed to fetch any datasets');
    }

    console.log('');
    console.log('Step 2: Processing data...');
    console.log('');

    // Process data only if available
    if (housingData) {
      const processedHousing = processHousingData(housingData);
      console.log('');
      console.log('Step 3: Saving housing data...');
      saveData(processedHousing, 'chicago-housing-data.json');
    }

    if (crimeData) {
      const processedCrime = processCrimeData(crimeData);
      console.log('Saving crime data...');
      saveData(processedCrime, 'chicago-crime-data.json');
    }

    if (calls311Data) {
      const processed311 = process311Data(calls311Data);
      console.log('Saving 311 data...');
      saveData(processed311, 'chicago-311-data.json');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✓ All data fetched and saved successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Use Raindrop MCP to create SmartBuckets');
    console.log('2. Upload these JSON files to respective buckets');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('✗ Error in main execution:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchData, processHousingData, processCrimeData, process311Data };
