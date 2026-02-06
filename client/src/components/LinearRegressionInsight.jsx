import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiApi, locationsApi } from '../services/api';
import Plot from 'react-plotly.js';

/**
 * LinearRegressionInsight - Displays AI-predicted priority of subareas per region.
 * Uses the ML model (model.pkl) trained with regression on AQI, PM2.5, PM10, BOD,
 * waste, green cover, population density. Shows a bar chart with priority scores
 * and a linear regression trend line.
 */
export default function LinearRegressionInsight() {
  const { user } = useAuth();
  const [allLocations, setAllLocations] = useState([]);
  const [subareas, setSubareas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function getDefaultRegion(usr, availableRegions, locations) {
    if (!availableRegions.length) return '';
    if (!usr) return availableRegions[0];
    if (usr.region && availableRegions.includes(usr.region)) return usr.region;
    if (usr.area && availableRegions.includes(usr.area)) return usr.area;
    if (usr.area && locations.length > 0) {
      const loc = locations.find((l) => l.name === usr.area || l.area === usr.area);
      if (loc && loc.region && availableRegions.includes(loc.region)) return loc.region;
    }
    if (Array.isArray(usr.subscribedAreas) && usr.subscribedAreas.length > 0) {
      const match = usr.subscribedAreas.find((a) => availableRegions.includes(a));
      if (match) return match;
    }
    if (Array.isArray(usr.subscribedAreas) && locations.length > 0) {
      const loc = locations.find((l) => usr.subscribedAreas.includes(l.name) || usr.subscribedAreas.includes(l.area));
      if (loc && loc.region && availableRegions.includes(loc.region)) return loc.region;
    }
    return availableRegions[0];
  }

  useEffect(() => {
    locationsApi
      .list()
      .then((locations) => {
        const locs = locations || [];
        setAllLocations(locs);
        const regions = [...new Set(locs.map((l) => l.region).filter(Boolean))].sort();
        const defaultRegion = getDefaultRegion(user, regions, locs);
        setSelectedRegion(defaultRegion || (regions.length > 0 ? regions[0] : ''));
      })
      .catch((err) => {
        setError(err.message || 'Could not load locations');
        setAllLocations([]);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedRegion) {
      setSubareas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    aiApi
      .priorityByRegion(selectedRegion)
      .then((data) => setSubareas(data || []))
      .catch((err) => {
        setError(err.message || 'AI service unavailable. Using fallback.');
        const filtered = allLocations.filter((l) => l.region === selectedRegion);
        const withScore = filtered.map((loc) => ({
          _id: loc._id,
          name: loc.name,
          region: loc.region,
          aqi: loc.aqi,
          aiPriorityScore: loc.priorityScore ?? 0,
          aiPriorityLabel: (loc.priorityScore ?? 0) > 80 ? 'High' : (loc.priorityScore ?? 0) > 45 ? 'Medium' : 'Low'
        }));
        setSubareas(withScore.sort((a, b) => (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0)));
      })
      .finally(() => setLoading(false));
  }, [selectedRegion, allLocations]);

  const regions = [...new Set(allLocations.map((l) => l.region).filter(Boolean))].sort();

  function linearRegression(xArr, yArr) {
    const n = xArr.length;
    if (n < 2) return null;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += xArr[i];
      sumY += yArr[i];
      sumXY += xArr[i] * yArr[i];
      sumX2 += xArr[i] * xArr[i];
    }
    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-10) return null;
    const m = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - m * sumX) / n;
    return xArr.map((x) => m * x + b);
  }

  if (loading && subareas.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white/90 rounded-2xl shadow-xl border-2 border-green-200/80">
        Loading AI priority data...
      </div>
    );
  }

  if (error && subareas.length === 0) {
    return (
      <div className="p-6 text-center text-red-600 bg-white/90 rounded-2xl shadow-xl border-2 border-red-200/80">
        Error: {error}
      </div>
    );
  }

  const names = subareas.map((s) => s.name);
  const scores = subareas.map((s) => Number(s.aiPriorityScore) || 0);
  const xArr = names.map((_, i) => i);
  const trendY = linearRegression(xArr, scores);

  const barColors = scores.map((s) => {
    if (s >= 75) return '#dc2626';
    if (s >= 45) return '#f59e0b';
    return '#10b981';
  });

  const barTrace = {
    x: names,
    y: scores,
    type: 'bar',
    name: 'AI Priority Score',
    marker: {
      color: barColors,
      line: { color: 'rgba(255,255,255,0.6)', width: 1 }
    },
    text: subareas.map((s) => `${s.name}<br>Score: ${(s.aiPriorityScore || 0).toFixed(1)}<br>Label: ${s.aiPriorityLabel}`),
    hovertemplate: '<b>%{text}</b><extra></extra>'
  };

  const traces = [barTrace];
  if (trendY && trendY.length > 0) {
    traces.push({
      x: names,
      y: trendY,
      type: 'scatter',
      mode: 'lines',
      name: 'Linear Regression Trend',
      line: { color: '#6366f1', width: 3, dash: 'dash' },
      hovertemplate: 'Trend: %{y:.1f}<extra></extra>'
    });
  }

  return (
    <section className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 border-green-200/80 p-6 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <span role="img" aria-hidden="true">📊</span> AI Subarea Priority
        </h2>
        <select
          value={selectedRegion || ''}
          onChange={(e) => setSelectedRegion(e.target.value || '')}
          className="px-3 py-2 rounded-lg border border-green-300 bg-white text-green-800 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select region</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
          {error}
        </div>
      )}
      {subareas.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No subareas in this region.</p>
      ) : (
        <div className="rounded-xl overflow-hidden border border-green-200/60">
          <Plot
            data={traces}
            layout={{
              title: { text: `Subarea Priority - ${selectedRegion || 'All'}`, font: { size: 16, color: '#065f46' } },
              xaxis: {
                title: 'Subarea',
                tickangle: -45,
                tickfont: { size: 10 },
                gridcolor: '#e5e7eb'
              },
              yaxis: {
                title: 'AI Priority Score (0-100)',
                range: [0, Math.max(100, Math.max(...scores) + 10)],
                gridcolor: '#e5e7eb'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: '#ffffff',
              font: { color: '#374151' },
              hovermode: 'x unified',
              legend: { x: 1, y: 1, xanchor: 'right' },
              margin: { l: 60, r: 40, t: 60, b: 120 },
              bargap: 0.2
            }}
            style={{ width: '100%', height: '420px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        </div>
      )}
    </section>
  );
}
