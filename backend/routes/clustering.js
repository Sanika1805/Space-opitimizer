const express = require('express');
const Location = require('../models/Location');
const { getClusterStats, getClustersByRegion } = require('../services/clusteringService');

const router = express.Router();

/**
 * GET /clustering/stats
 * Get overall cluster statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getClusterStats(Location);
    
    const formatted = {
      highPriority: stats.find(s => s._id === 'High Priority') || { count: 0, avgPriority: 0 },
      mediumPriority: stats.find(s => s._id === 'Medium Priority') || { count: 0, avgPriority: 0 },
      lowPriority: stats.find(s => s._id === 'Low Priority') || { count: 0, avgPriority: 0 }
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /clustering/by-region
 * Get cluster distribution by region
 */
router.get('/by-region', async (req, res) => {
  try {
    const region = req.query.region || null;
    const stats = await getClustersByRegion(Location, region);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /clustering/areas/:priority
 * Get all areas in a specific priority category
 * priority: 'high', 'medium', 'low'
 */
router.get('/areas/:priority', async (req, res) => {
  try {
    const priorityMap = {
      'high': 'High Priority',
      'medium': 'Medium Priority',
      'low': 'Low Priority'
    };
    
    const category = priorityMap[req.params.priority.toLowerCase()];
    if (!category) {
      return res.status(400).json({ error: 'Invalid priority. Use: high, medium, or low' });
    }

    const areas = await Location.find({ priorityCategory: category })
      .select('name region priorityScore priorityCategory')
      .sort({ priorityScore: -1 });

    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
