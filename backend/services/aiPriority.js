const Location = require('../models/Location');
const Drive = require('../models/Drive');

const garbageWeight = { low: 1, medium: 2, high: 3 };

async function getPriorityLocations(query = {}) {
  const { region, limit = 10 } = query;
  const filter = region ? { region } : {};
  const locations = await Location.find(filter).lean();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const withScores = await Promise.all(
    locations.map(async (loc) => {
      const lastDrive = await Drive.findOne({ location: loc._id, status: 'completed' })
        .sort({ date: -1 })
        .lean();
      const lastCampDate = lastDrive ? new Date(lastDrive.date) : null;
      const daysSinceCamp = lastCampDate
        ? Math.floor((now - lastCampDate) / (24 * 60 * 60 * 1000))
        : 999;
      const aqiScore = Math.min(200, Math.max(0, loc.aqi || 100));
      const garbageScore = (garbageWeight[loc.garbageLevel] || 2) * 20;
      const plantScore = Math.max(0, 30 - (loc.plantCount || 0));
      const recencyScore = Math.min(100, daysSinceCamp * 2);
      const priorityScore = aqiScore * 0.3 + garbageScore * 0.3 + recencyScore * 0.25 + plantScore * 0.15;
      return {
        ...loc,
        priorityScore: Math.round(priorityScore),
        daysSinceCamp: lastCampDate ? daysSinceCamp : null
      };
    })
  );

  withScores.sort((a, b) => b.priorityScore - a.priorityScore);
  return withScores.slice(0, parseInt(limit, 10) || 10);
}

module.exports = { getPriorityLocations };
