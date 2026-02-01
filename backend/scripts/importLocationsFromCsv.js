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

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(subArea, parent, lat, lng, aqi) + 1) continue;

    const name = cols[subArea] || `Area ${i}`;
    const region = cols[parent] || 'Unknown';
    const aqiVal = parseFloat(cols[aqi]);
    const wasteVal = wasteIdx >= 0 ? cols[wasteIdx] : null;
    const greenVal = greenIdx >= 0 ? parseFloat(cols[greenIdx]) : null;

    await Location.findOneAndUpdate(
      { name, region },
      {
        name,
        region,
        lat: parseFloat(cols[lat]) || 0,
        lng: parseFloat(cols[lng]) || 0,
        aqi: isNaN(aqiVal) ? 100 : aqiVal,
        garbageLevel: wasteToGarbageLevel(wasteVal),
        plantCount: isNaN(greenVal) ? 0 : Math.round(greenVal / 5)
      },
      { upsert: true, new: true }
    );
    imported++;
    console.log('Imported:', name, region, 'AQI:', aqiVal);
  }

  console.log('\nDone. Imported/updated', imported, 'locations.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
