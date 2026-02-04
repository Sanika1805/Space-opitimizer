import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { locationsApi } from '../services/api';

export default function LinearRegressionInsight() {
  const { user } = useAuth();
  const [allLocations, setAllLocations] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after data loads
    if (!loading && allLocations.length > 0) {
      setAnimate(true);
    }
  }, [loading, allLocations]);

  function getDefaultRegion(usr, availableRegions) {
    if (!availableRegions.length) return '';
    if (!usr) return availableRegions[0];
    if (usr.area && availableRegions.includes(usr.area)) return usr.area;
    if (usr.region && availableRegions.includes(usr.region)) return usr.region;
    if (Array.isArray(usr.subscribedAreas) && usr.subscribedAreas.length > 0) {
      const match = usr.subscribedAreas.find((a) => availableRegions.includes(a));
      if (match) return match;
    }
    return availableRegions[0];
  }

  function calculatePriorityScores(locationsList) {
    if (locationsList.length === 0) return [];
    
    // Use priorityScore from database if available, otherwise calculate
    return locationsList.map((loc) => {
      const priority = loc.priorityScore ? Math.round(loc.priorityScore) : 0;
      return { ...loc, priority };
    });
  }

  useEffect(() => {
    locationsApi
      .list()
      .then((locations) => {
        setAllLocations(locations || []);
        const regions = [...new Set((locations || []).map((l) => l.region).filter(Boolean))].sort();
        const defaultRegion = getDefaultRegion(user, regions);
        setSelectedRegion(defaultRegion || (regions.length > 0 ? regions[0] : ''));
      })
      .catch((err) => {
        setError(err.message || 'Could not load locations');
        setAllLocations([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const regions = [...new Set(allLocations.map((l) => l.region).filter(Boolean))].sort();
  
  // Filter locations based on user's subscribed areas (from profile)
  let locationsToUse = allLocations;
  if (user && Array.isArray(user.subscribedAreas) && user.subscribedAreas.length > 0) {
    const filtered = allLocations.filter((l) => 
      user.subscribedAreas.includes(l.name) || 
      user.subscribedAreas.includes(l.area) ||
      user.subscribedAreas.some(area => l.name?.toLowerCase().includes(area?.toLowerCase()))
    );
    // If filter returns results, use it; otherwise show all locations
    locationsToUse = filtered.length > 0 ? filtered : allLocations;
  }
  
  // Further filter by region if selected
  const filtered = selectedRegion ? locationsToUse.filter((l) => l.region === selectedRegion) : locationsToUse;
  const withAqi = filtered
    .filter((l) => l.aqi != null && !isNaN(Number(l.aqi)))
    .map((l) => ({ ...l, aqi: Number(l.aqi) }))
    .sort((a, b) => (b.aqi || 0) - (a.aqi || 0));
  const maxAqi = withAqi.length ? Math.max(...withAqi.map((l) => l.aqi), 1) : 1;
  const scaleMax = Math.min(250, Math.max(200, Math.ceil(maxAqi / 20) * 20));
  const withPriority = calculatePriorityScores(filtered).sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg shadow-2xl">
      <style>{`
        @keyframes fillBar {
          from {
            height: 0%;
            opacity: 0;
          }
          to {
            height: var(--bar-height);
            opacity: 1;
          }
        }
        .animate-fill {
          animation: fillBar 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">📊 Environmental Analytics</h2>
        <div className="w-56">
          <select
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || '')}
            className="w-full px-3 py-2 rounded-lg border border-slate-500 bg-slate-700 text-sm text-white font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-b border-slate-700">
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-b border-slate-700">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <span className="text-lg">🌍</span> AQI by Area
          </h3>
        </div>
        {withAqi.length === 0 ? (
          <p className="text-slate-400 text-sm text-center p-4">No AQI data available</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 h-[420px] p-4" style={{ minWidth: 'min-content' }}>
              {withAqi.slice(0, 22).map((loc, i) => {
                const heightPct = (loc.aqi / scaleMax) * 100;
                const barColor = loc.aqi > 155 ? '#ef4444' : loc.aqi > 120 ? '#f59e0b' : '#10b981';
                return (
                  <div key={loc._id || i} className="flex flex-col items-center flex-1 min-w-[45px] h-full justify-end gap-1.5">
                    <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded">{loc.aqi}</span>
                    <div
                      className={`w-full rounded-t-lg shadow-lg hover:shadow-2xl transition-all duration-300 ${animate ? 'animate-fill' : ''}`}
                      style={{
                        '--bar-height': `${Math.max(heightPct, 4)}%`,
                        backgroundColor: barColor,
                        minHeight: '16px',
                        height: animate ? `${Math.max(heightPct, 4)}%` : '0%'
                      }}
                      title={`${loc.name}: ${loc.aqi}`}
                    />
                    <p className="text-xs font-semibold text-slate-300 truncate leading-tight" style={{ maxWidth: '45px' }} title={loc.name}>
                      {loc.name.length > 7 ? loc.name.substring(0, 7) : loc.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-b border-slate-700">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <span className="text-lg">⭐</span> Priority Score
          </h3>
        </div>
        {withPriority.length === 0 ? (
          <p className="text-slate-400 text-sm text-center p-4">No priority data available</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 h-[420px] p-4" style={{ minWidth: 'min-content' }}>
              {withPriority.slice(0, 22).map((loc, i) => {
                const heightPct = (loc.priority / 100) * 100;
                const barColor = loc.priority > 80 ? '#8b5cf6' : loc.priority > 60 ? '#3b82f6' : '#06b6d4';
                return (
                  <div key={loc._id || i} className="flex flex-col items-center flex-1 min-w-[45px] h-full justify-end gap-1.5">
                    <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded">{loc.priority}%</span>
                    <div
                      className={`w-full rounded-t-lg shadow-lg hover:shadow-2xl transition-all duration-300 ${animate ? 'animate-fill' : ''}`}
                      style={{
                        '--bar-height': `${Math.max(heightPct, 4)}%`,
                        backgroundColor: barColor,
                        minHeight: '16px',
                        height: animate ? `${Math.max(heightPct, 4)}%` : '0%'
                      }}
                      title={`${loc.name}: ${loc.priority}%`}
                    />
                    <p className="text-xs font-semibold text-slate-300 truncate leading-tight" style={{ maxWidth: '45px' }} title={loc.name}>
                      {loc.name.length > 7 ? loc.name.substring(0, 7) : loc.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
