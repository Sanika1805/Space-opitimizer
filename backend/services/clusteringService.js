/**
 * Clustering Service: Categorize locations into priority clusters
 * Uses K-Means to classify areas as Low, Medium, or High Priority
 */

function getClustersFromScores(scores) {
  if (!scores || scores.length === 0) return [];

  // Simple K-Means implementation
  const n_clusters = 3;
  
  // Sort scores
  const sortedScores = [...scores].sort((a, b) => a - b);
  
  // Initialize centroids (Low, Medium, High)
  const min = sortedScores[0];
  const max = sortedScores[sortedScores.length - 1];
  const range = max - min;
  
  let centroids = [
    min + range * 0.25,      // Low priority centroid
    min + range * 0.5,       // Medium priority centroid
    min + range * 0.75       // High priority centroid
  ];

  // Simple assignment without iteration (for performance)
  const clusters = scores.map(score => {
    let closest = 0;
    let minDist = Math.abs(score - centroids[0]);
    
    for (let i = 1; i < centroids.length; i++) {
      const dist = Math.abs(score - centroids[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    return closest;
  });

  return clusters;
}

function getPriorityLabel(clusterIndex) {
  const labels = {
    0: 'Low Priority',
    1: 'Medium Priority',
    2: 'High Priority'
  };
  return labels[clusterIndex] || 'Unknown';
}

async function clusterLocations(locations) {
  /**
   * Cluster locations based on priority scores
   * Returns locations with cluster_id and priority_cluster
   */
  if (!locations || locations.length === 0) return [];

  try {
    // Extract priority scores
    const scores = locations.map(loc => loc.priorityScore || 0);
    
    // Get cluster assignments
    const clusterIds = getClustersFromScores(scores);
    
    // Add cluster info to locations
    return locations.map((loc, idx) => ({
      ...loc,
      cluster_id: clusterIds[idx],
      priority_cluster: getPriorityLabel(clusterIds[idx])
    }));
  } catch (err) {
    console.error('Error in clustering:', err);
    return locations;
  }
}

async function updateLocationClusters(Location) {
  /**
   * Update all locations in database with cluster assignments
   */
  try {
    const locations = await Location.find({});
    const clusteredLocations = await clusterLocations(locations);
    
    // Bulk update database
    const bulkOps = clusteredLocations.map(loc => ({
      updateOne: {
        filter: { _id: loc._id },
        update: {
          $set: {
            clusterGroup: loc.cluster_id,
            priorityCategory: loc.priority_cluster
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Location.bulkWrite(bulkOps);
      console.log(`✅ Updated ${bulkOps.length} locations with cluster info`);
    }
    
    return true;
  } catch (err) {
    console.error('Error updating clusters:', err);
    return false;
  }
}

async function getClusterStats(Location) {
  /**
   * Get statistics about clusters
   */
  try {
    const stats = await Location.aggregate([
      {
        $group: {
          _id: '$priorityCategory',
          count: { $sum: 1 },
          avgPriority: { $avg: '$priorityScore' },
          maxPriority: { $max: '$priorityScore' },
          minPriority: { $min: '$priorityScore' }
        }
      },
      { $sort: { avgPriority: -1 } }
    ]);

    return stats;
  } catch (err) {
    console.error('Error getting cluster stats:', err);
    return [];
  }
}

async function getClustersByRegion(Location, region = null) {
  /**
   * Get cluster distribution by region
   */
  try {
    const query = region ? { region } : {};
    
    const stats = await Location.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            region: '$region',
            priority: '$priorityCategory'
          },
          count: { $sum: 1 },
          avgPriority: { $avg: '$priorityScore' }
        }
      },
      { $sort: { '_id.region': 1, avgPriority: -1 } }
    ]);

    return stats;
  } catch (err) {
    console.error('Error getting region clusters:', err);
    return [];
  }
}

module.exports = {
  getClustersFromScores,
  getPriorityLabel,
  clusterLocations,
  updateLocationClusters,
  getClusterStats,
  getClustersByRegion
};
