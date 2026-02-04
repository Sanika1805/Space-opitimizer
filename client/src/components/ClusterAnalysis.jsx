import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ClusterAnalysis() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [highPriorityAreas, setHighPriorityAreas] = useState([]);
  const [mediumPriorityAreas, setMediumPriorityAreas] = useState([]);
  const [lowPriorityAreas, setLowPriorityAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/clustering/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch areas by priority
        const [high, medium, low] = await Promise.all([
          fetch('/api/clustering/areas/high').then(r => r.json()),
          fetch('/api/clustering/areas/medium').then(r => r.json()),
          fetch('/api/clustering/areas/low').then(r => r.json())
        ]);

        setHighPriorityAreas(high);
        setMediumPriorityAreas(medium);
        setLowPriorityAreas(low);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading cluster analysis...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        📊 Priority Cluster Analysis
      </h2>

      {/* Cluster Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* High Priority */}
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-semibold">🚨 High Priority</p>
              <p className="text-3xl font-bold text-red-400">{stats?.highPriority?.count || 0}</p>
              <p className="text-xs text-red-300 mt-1">
                Avg: {stats?.highPriority?.avgPriority?.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>

        {/* Medium Priority */}
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-semibold">⚠️ Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-400">{stats?.mediumPriority?.count || 0}</p>
              <p className="text-xs text-yellow-300 mt-1">
                Avg: {stats?.mediumPriority?.avgPriority?.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-4xl">📌</div>
          </div>
        </div>

        {/* Low Priority */}
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-semibold">✅ Low Priority</p>
              <p className="text-3xl font-bold text-green-400">{stats?.lowPriority?.count || 0}</p>
              <p className="text-xs text-green-300 mt-1">
                Avg: {stats?.lowPriority?.avgPriority?.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-4xl">☑️</div>
          </div>
        </div>
      </div>

      {/* High Priority Areas */}
      {highPriorityAreas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
            <span className="text-xl">🚨</span> High Priority Areas ({highPriorityAreas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {highPriorityAreas.slice(0, 15).map((area) => (
              <div key={area._id} className="bg-red-900/20 border border-red-700/50 rounded p-3">
                <p className="text-red-300 font-semibold text-sm">{area.name}</p>
                <p className="text-xs text-red-200">{area.region}</p>
                <p className="text-xs text-red-400 mt-1">Priority: {area.priorityScore?.toFixed(1) || 0}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Areas */}
      {mediumPriorityAreas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span> Medium Priority Areas ({mediumPriorityAreas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {mediumPriorityAreas.slice(0, 15).map((area) => (
              <div key={area._id} className="bg-yellow-900/20 border border-yellow-700/50 rounded p-3">
                <p className="text-yellow-300 font-semibold text-sm">{area.name}</p>
                <p className="text-xs text-yellow-200">{area.region}</p>
                <p className="text-xs text-yellow-400 mt-1">Priority: {area.priorityScore?.toFixed(1) || 0}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Areas */}
      {lowPriorityAreas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
            <span className="text-xl">✅</span> Low Priority Areas ({lowPriorityAreas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {lowPriorityAreas.slice(0, 15).map((area) => (
              <div key={area._id} className="bg-green-900/20 border border-green-700/50 rounded p-3">
                <p className="text-green-300 font-semibold text-sm">{area.name}</p>
                <p className="text-xs text-green-200">{area.region}</p>
                <p className="text-xs text-green-400 mt-1">Priority: {area.priorityScore?.toFixed(1) || 0}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
