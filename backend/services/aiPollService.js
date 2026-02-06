// backend/services/aiPollService.js

const axios = require('axios');
const { getPriorityLocations } = require('./aiPriority');
const { TIME_SLOTS } = require('../models/Poll');

function decideDriveLocation(pollResults) {
  let maxVotes = 0;
  let selectedArea = null;

  for (const area in pollResults) {
    if (pollResults[area] > maxVotes) {
      maxVotes = pollResults[area];
      selectedArea = area;
    }
  }

  const totalVotes = Object.values(pollResults).reduce((a, b) => a + b, 0);
  const confidence = totalVotes > 0 ? maxVotes / totalVotes : 0;

  return {
    selectedArea,
    confidence: Number(confidence.toFixed(2))
  };
}

function decidePreferredTime(timeSlotVotes) {
  let maxVotes = 0;
  let selectedTimeSlot = null;
  for (const slot in timeSlotVotes) {
    if (TIME_SLOTS.includes(slot) && timeSlotVotes[slot] > maxVotes) {
      maxVotes = timeSlotVotes[slot];
      selectedTimeSlot = slot;
    }
  }
  const total = Object.keys(timeSlotVotes).filter((k) => TIME_SLOTS.includes(k)).reduce((s, k) => s + timeSlotVotes[k], 0);
  const confidence = total > 0 ? Number((maxVotes / total).toFixed(2)) : 0;
  return { selectedTimeSlot: selectedTimeSlot || TIME_SLOTS[0], confidence };
}

/**
 * Get high-priority areas for a region (aligned with priority_algo.ipynb / model.pkl).
 * Tries Python AI service first for priority_label; falls back to aqiPriority.
 */
async function getHighPriorityAreasForPoll(region, limit = 5) {
  const locations = await getPriorityLocations({ region, limit: limit * 3 });
  let highPriority = locations.filter((loc) => loc.aqiPriority === 'High');

  try {
    const withModelPriority = await Promise.all(
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
        const res = await axios.post('http://127.0.0.1:8000/predict', payload, { timeout: 3000 });
        return { ...loc, modelPriorityLabel: res.data?.priority_label || null };
      })
    );
    const byModel = withModelPriority.filter((l) => l.modelPriorityLabel === 'High');
    if (byModel.length > 0) highPriority = byModel;
  } catch (_) {
  }

  const top = (highPriority.length > 0 ? highPriority : locations).slice(0, limit);
  return top.map((loc) => ({ locationId: loc._id, name: loc.name }));
}

/**
 * Get the highest-priority region (calculated from all locations). Returns region name and top location full name.
 */
async function getHighestPriorityRegion() {
  const locations = await getPriorityLocations({ limit: 1 });
  if (!locations || locations.length === 0) return null;
  const top = locations[0];
  return {
    region: top.region,
    fullName: top.name
  };
}

function getThisWeekMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getThisWeekFridayEnd() {
  const monday = getThisWeekMonday();
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return friday;
}

module.exports = {
  decideDriveLocation,
  decidePreferredTime,
  getHighPriorityAreasForPoll,
  getHighestPriorityRegion,
  getThisWeekMonday,
  getThisWeekFridayEnd,
  TIME_SLOTS
};
