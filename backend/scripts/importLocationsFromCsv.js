/**
 * Import locations from abcd.csv (Task1.ipynb format)
 * Columns: sub_area_name, parent_area, latitude, longitude, AQI, PM2_5, PM10, BOD,
 *          waste_tons_per_day, green_cover_percent, population_density, temperature, rainfall, pollution_level
 *
 * Run: node scripts/importLocationsFromCsv.js [path-to-abcd.csv]
 * Default path: ./abcd.csv (place file in backend/ or pass full path)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Location = require('../models/Location');
const { updateLocationClusters } = require('../services/clusteringService');

const csvPath = process.argv[2] || path.join(__dirname, '..', 'abcd.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === '\n' || c === '\r') {
      result.push(current.trim());
      current = '';
      if (c === '\n' || c === '\r') break;
    } else {
      current += c;
    }
  }
  if (current.length > 0) result.push(current.trim());
  return result;
}

function wasteToGarbageLevel(waste) {
  const w = parseFloat(waste);
  if (isNaN(w)) return 'medium';
  if (w <= 12) return 'low';
  if (w <= 20) return 'medium';
  return 'high';
}

async function run() {
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    console.log('Usage: node scripts/importLocationsFromCsv.js [path-to-abcd.csv]');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/green-space');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCSVLine(lines[0]);
  const idx = (name) => header.indexOf(name);

  const subArea = idx('sub_area_name');
  const parent = idx('parent_area');
  const lat = idx('latitude');
  const lng = idx('longitude');
  const aqi = idx('AQI');

  if (subArea < 0 || parent < 0 || lat < 0 || lng < 0 || aqi < 0) {
    console.error('Required columns not found. Expected: sub_area_name, parent_area, latitude, longitude, AQI');
    process.exit(1);
  }

  const wasteIdx = idx('waste_tons_per_day');
  const greenIdx = idx('green_cover_percent');
  const bodIdx = idx('BOD');
  const pm25Idx = idx('PM2_5');
  const pm10Idx = idx('PM10');
  const popIdx = idx('population_density');
  const pollutionIdx = idx('pollution_level');

  // Helper function to normalize values
  function normalize(values) {
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return values.map(() => 0.5);
    return values.map((v) => (v - min) / (max - min));
  }

  // First pass: collect all values for normalization
  const allAqiValues = [];
  const allBodValues = [];
  const allWasteValues = [];
  const allPm25Values = [];
  const allPm10Values = [];
  const allPopValues = [];
  const allPollutionValues = [];
  const pollutionMap = { Low: 1, Medium: 2, High: 3, low: 1, medium: 2, high: 3 };

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(subArea, parent, lat, lng, aqi) + 1) continue;
    
    allAqiValues.push(parseFloat(cols[aqi]) || 0);
    allBodValues.push(bodIdx >= 0 ? parseFloat(cols[bodIdx]) || 0 : 0);
    allWasteValues.push(wasteIdx >= 0 ? parseFloat(cols[wasteIdx]) || 0 : 0);
    allPm25Values.push(pm25Idx >= 0 ? parseFloat(cols[pm25Idx]) || 0 : 0);
    allPm10Values.push(pm10Idx >= 0 ? parseFloat(cols[pm10Idx]) || 0 : 0);
    allPopValues.push(popIdx >= 0 ? parseFloat(cols[popIdx]) || 0 : 0);
    allPollutionValues.push(pollutionIdx >= 0 ? pollutionMap[cols[pollutionIdx]] || 2 : 2);
  }

  // Normalize all values
  const aqiNorms = normalize(allAqiValues);
  const bodNorms = normalize(allBodValues);
  const wasteNorms = normalize(allWasteValues);
  const pm25Norms = normalize(allPm25Values);
  const pm10Norms = normalize(allPm10Values);
  const popNorms = normalize(allPopValues);
  const pollutionNorms = normalize(allPollutionValues);

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(subArea, parent, lat, lng, aqi) + 1) continue;

    const name = cols[subArea] || `Area ${i}`;
    const region = cols[parent] || 'Unknown';
    const aqiVal = parseFloat(cols[aqi]) || 0;
    const bodVal = bodIdx >= 0 ? parseFloat(cols[bodIdx]) || 0 : 0;
    const wasteVal = wasteIdx >= 0 ? parseFloat(cols[wasteIdx]) || 0 : 0;
    const pm25Val = pm25Idx >= 0 ? parseFloat(cols[pm25Idx]) || 0 : 0;
    const pm10Val = pm10Idx >= 0 ? parseFloat(cols[pm10Idx]) || 0 : 0;
    const greenVal = greenIdx >= 0 ? parseFloat(cols[greenIdx]) || 0 : 0;
    const popVal = popIdx >= 0 ? parseFloat(cols[popIdx]) || 0 : 0;
    const pollutionLevel = pollutionIdx >= 0 ? cols[pollutionIdx] || 'medium' : 'medium';

    // Calculate priority score using normalized values
    // Note: green_def_norm is NOT normalized, just (100-green)/100
    const greenDefNorm = (100 - greenVal) / 100;
    let priorityScore = (
      (aqiNorms[i - 1] * 0.30) +
      (bodNorms[i - 1] * 0.20) +
      (wasteNorms[i - 1] * 0.15) +
      (pm25Norms[i - 1] * 0.15) +
      (pm10Norms[i - 1] * 0.10) +
      (greenDefNorm * 0.10) +
      (popNorms[i - 1] * 0.05) +
      (pollutionNorms[i - 1] * 0.05)
    ) * 100;
    
    // Ensure score is between 0-100
    priorityScore = Math.max(0, Math.min(100, priorityScore));

    await Location.findOneAndUpdate(
      { name, region },
      {
        name,
        area: name,
        region,
        lat: parseFloat(cols[lat]) || 0,
        lng: parseFloat(cols[lng]) || 0,
        aqi: aqiVal,
        bod: bodVal,
        wastePerDay: wasteVal,
        pm25: pm25Val,
        pm10: pm10Val,
        greenCoverPercent: greenVal,
        populationDensity: popVal,
        pollutionLevel: pollutionLevel.toLowerCase(),
        priorityScore: Math.round(priorityScore * 10) / 10,
        garbageLevel: wasteToGarbageLevel(wasteVal)
      },
      { upsert: true, new: true }
    );
    imported++;
    console.log(`Imported: ${name} | Region: ${region} | AQI: ${aqiVal} | Priority: ${Math.round(priorityScore * 10) / 10}`);
  }

  console.log('\nDone. Imported/updated', imported, 'locations.');
  
  // Apply clustering
  console.log('\n🔄 Clustering locations by priority...');
  await updateLocationClusters(Location);
  
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
