/**
 * Verify CSV Import: Check if priority scores are stored correctly
 * Run: node scripts/verifyImport.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/Location');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/green-space');
    
    console.log('🔍 VERIFYING IMPORT...\n');
    
    const total = await Location.countDocuments();
    console.log(`✅ Total locations in DB: ${total}`);
    
    if (total === 0) {
      console.log('❌ No locations found! Run: node scripts/importLocationsFromCsv.js');
      await mongoose.disconnect();
      process.exit(1);
    }
    
    // Get top 10 by priority
    const top10 = await Location.find()
      .sort({ priorityScore: -1 })
      .limit(10)
      .select('name region aqi bod wastePerDay pm25 pm10 greenCoverPercent priorityScore');
    
    console.log('\n🏆 TOP 10 LOCATIONS BY PRIORITY SCORE:\n');
    console.log('Name | Region | AQI | BOD | Waste | PM2.5 | PM10 | Green% | Priority Score');
    console.log('='.repeat(100));
    
    top10.forEach((loc, idx) => {
      console.log(
        `${idx + 1}. ${loc.name.padEnd(30)} | ${(loc.region || '-').padEnd(12)} | ${loc.aqi} | ${loc.bod} | ${loc.wastePerDay} | ${loc.pm25} | ${loc.pm10} | ${loc.greenCoverPercent} | ${loc.priorityScore}`
      );
    });
    
    // Check for missing priority scores
    const withoutPriority = await Location.countDocuments({ priorityScore: { $exists: false } });
    const withPriority = await Location.countDocuments({ priorityScore: { $exists: true } });
    
    console.log(`\n📊 Priority Scores in DB:`);
    console.log(`   ✅ With priority score: ${withPriority}`);
    console.log(`   ❌ Without priority score: ${withoutPriority}`);
    
    if (withPriority === total) {
      console.log('\n✅ ALL LOCATIONS HAVE PRIORITY SCORES!');
    } else {
      console.log(`\n⚠️  Only ${withPriority}/${total} have priority scores. Re-run import script.`);
    }
    
    // Check data completeness
    const sample = await Location.findOne().sort({ priorityScore: -1 });
    if (sample) {
      console.log('\n📋 Sample location data:');
      console.log(`   Name: ${sample.name}`);
      console.log(`   Region: ${sample.region}`);
      console.log(`   AQI: ${sample.aqi}`);
      console.log(`   BOD: ${sample.bod}`);
      console.log(`   Waste/Day: ${sample.wastePerDay}`);
      console.log(`   PM2.5: ${sample.pm25}`);
      console.log(`   PM10: ${sample.pm10}`);
      console.log(`   Green Cover: ${sample.greenCoverPercent}%`);
      console.log(`   Priority Score: ${sample.priorityScore}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Verification complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verify();
