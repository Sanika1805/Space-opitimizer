import { useState } from 'react';
import { aiApi } from '../services/api';

export default function EmergencyChatbot() {
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    if (!query.trim()) return;
    setLoading(true);
    setActions([]);
    aiApi
      .emergencyActions(query)
      .then((data) => setActions(data.actions || []))
      .catch(() => setActions(['Something went wrong. Call emergency: 112']))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">Emergency guide</h3>
      <p className="text-sm text-gray-600 mb-3">Describe the situation (e.g. someone injured, snake bite) to get suggested actions.</p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Someone got injured"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Get actions'}
        </button>
      </div>
      {actions.length > 0 && (
        <ul className="list-decimal list-inside space-y-1 text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
          {actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
