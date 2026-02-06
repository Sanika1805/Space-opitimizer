/**
 * Get subareas of a region with AI-predicted priority scores.
 * Uses the Python ML model (model.pkl) - trained with regression on AQI, PM2.5, PM10, BOD,
 * waste, green cover, population density. Returns priority_score (0-100) and priority_label (High/Medium/Low).
 */
const axios = require('axios');
const Location = require('../models/Location');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

async function getSubareasWithAiPriority(region) {
  const filter = region ? { region } : {};
  const locations = await Location.find(filter).lean();
  if (locations.length === 0) return [];

  const results = await Promise.all(
    locations.map(async (loc) => {
      const payload = {
        AQI: loc.aqi ?? 100,
        PM2_5: loc.pm25 ?? 80,
        PM10: loc.pm10 ?? 100,
        BOD: loc.bod ?? 10,
        waste_tons_per_day: loc.wastePerDay ?? 15,
        green_cover_percent: loc.greenCoverPercent ?? 20,
        population_density: loc.populationDensity ?? 12000
      };
      try {
        const res = await axios.post(`${AI_SERVICE_URL}/predict`, payload, { timeout: 5000 });
        return {
          _id: loc._id,
          name: loc.name,
          region: loc.region,
          aqi: loc.aqi,
          aiPriorityScore: res.data?.priority_score ?? loc.priorityScore ?? 0,
          aiPriorityLabel: res.data?.priority_label ?? 'Medium'
        };
      } catch (_) {
        return {
          _id: loc._id,
          name: loc.name,
          region: loc.region,
          aqi: loc.aqi,
          aiPriorityScore: loc.priorityScore ?? 0,
          aiPriorityLabel: 'Medium'
        };
      }
    })
  );

  return results.sort((a, b) => (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0));
}

module.exports = { getSubareasWithAiPriority };
