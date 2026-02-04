import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

export default function ClusteringVisualization() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch all locations with cluster info
        const response = await fetch('/api/locations');
        const data = await response.json();
        setLocations(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading cluster visualization...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  // Separate locations by cluster
  const highPriority = locations.filter(l => l.priorityCategory === 'High Priority');
  const mediumPriority = locations.filter(l => l.priorityCategory === 'Medium Priority');
  const lowPriority = locations.filter(l => l.priorityCategory === 'Low Priority');

  // Create scatter plot traces for each cluster
  const createTrace = (data, name, color) => ({
    x: data.map((_, idx) => idx),
    y: data.map(d => d.priorityScore || 0),
    mode: 'markers',
    name: name,
    type: 'scatter',
    marker: {
      size: 12,
      color: color,
      opacity: 0.7,
      line: {
        color: 'white',
        width: 2
      }
    },
    text: data.map(d => `${d.name}<br>Region: ${d.region}<br>Priority: ${d.priorityScore?.toFixed(1)}%`),
    hovertemplate: '<b>%{text}</b><extra></extra>',
    customdata: data.map(d => d._id),
    hoverlabel: {
      bgcolor: 'white',
      font: { size: 14, color: 'black' }
    }
  });

  const traces = [
    createTrace(highPriority, '🚨 High Priority', '#ef4444'),
    createTrace(mediumPriority, '⚠️ Medium Priority', '#f59e0b'),
    createTrace(lowPriority, '✅ Low Priority', '#10b981')
  ];

  const handleClick = (event) => {
    if (event.points.length > 0) {
      const point = event.points[0];
      const areaId = point.customdata;
      const area = locations.find(l => l._id === areaId);
      setSelectedArea(area);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🎯 K-Means Clustering Visualization
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plot */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4">
          <Plot
            data={traces}
            layout={{
              title: {
                text: 'Area Priority Clustering',
                font: { color: 'white', size: 18 }
              },
              xaxis: {
                title: 'Area Index',
                gridcolor: '#475569',
                zerolinecolor: '#475569',
                tickfont: { color: 'white' }
              },
              yaxis: {
                title: 'Priority Score (%)',
                gridcolor: '#475569',
                zerolinecolor: '#475569',
                tickfont: { color: 'white' }
              },
              plot_bgcolor: '#1e293b',
              paper_bgcolor: '#0f172a',
              font: { color: 'white' },
              hovermode: 'closest',
              legend: {
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                bordercolor: '#475569',
                borderwidth: 1,
                font: { color: 'white' }
              },
              margin: { l: 80, r: 40, t: 80, b: 80 }
            }}
            style={{ width: '100%', height: '500px' }}
            onClick={handleClick}
            config={{ responsive: true, displayModeBar: true }}
          />
        </div>

        {/* Cluster Legend and Selected Area Info */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4">📊 Clusters</h3>
            
            <div className="space-y-3">
              {/* High Priority */}
              <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700 rounded">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-red-300 font-semibold text-sm">High Priority</p>
                  <p className="text-red-200 text-xs">{highPriority.length} areas</p>
                </div>
              </div>

              {/* Medium Priority */}
              <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-yellow-300 font-semibold text-sm">Medium Priority</p>
                  <p className="text-yellow-200 text-xs">{mediumPriority.length} areas</p>
                </div>
              </div>

              {/* Low Priority */}
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700 rounded">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-green-300 font-semibold text-sm">Low Priority</p>
                  <p className="text-green-200 text-xs">{lowPriority.length} areas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Area Details */}
          {selectedArea && (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">📍 Selected Area</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase">Name</p>
                  <p className="text-white font-semibold">{selectedArea.name}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase">Region</p>
                  <p className="text-white">{selectedArea.region}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase">Priority Category</p>
                  <p className="text-white font-semibold">
                    {selectedArea.priorityCategory === 'High Priority' && '🚨 High Priority'}
                    {selectedArea.priorityCategory === 'Medium Priority' && '⚠️ Medium Priority'}
                    {selectedArea.priorityCategory === 'Low Priority' && '✅ Low Priority'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase">Priority Score</p>
                  <p className="text-white text-2xl font-bold">{selectedArea.priorityScore?.toFixed(1) || 0}%</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-slate-400 text-xs">AQI</p>
                    <p className="text-white font-semibold">{selectedArea.aqi || '-'}</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-slate-400 text-xs">BOD</p>
                    <p className="text-white font-semibold">{selectedArea.bod || '-'}</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-slate-400 text-xs">Waste/Day</p>
                    <p className="text-white font-semibold">{selectedArea.wastePerDay || '-'}</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-slate-400 text-xs">Green %</p>
                    <p className="text-white font-semibold">{selectedArea.greenCoverPercent || '-'}%</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedArea(null)}
                  className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold text-sm transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {!selectedArea && (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">
                💡 Click on a dot in the chart to view area details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <span className="font-semibold">ℹ️ About K-Means Clustering:</span> The visualization shows how areas are automatically grouped into 3 priority levels based on their priority scores. Each dot represents an area, colored by its cluster. Hover over dots to see area names, click to see detailed metrics.
        </p>
      </div>
    </div>
  );
}
