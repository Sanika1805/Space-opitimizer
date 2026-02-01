import { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsApi
      .list()
      .then(setData)
      .catch(() => setData({ notifications: [], unreadCount: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = (id) => {
    notificationsApi.markRead(id).then(() => load());
  };

  const handleMarkAllRead = () => {
    notificationsApi.markAllRead().then(() => load());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Notifications</h1>
          {data.unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Mark all as read
            </button>
          )}
        </div>

        {data.notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            No notifications yet. Area alerts will appear here when your region has AQI updates.
          </div>
        ) : (
          <div className="space-y-4">
            {data.notifications.map((n) => (
              <div
                key={n._id}
                className={`bg-white rounded-xl shadow border-l-4 p-4 ${
                  n.read ? 'border-gray-200' : 'border-green-500'
                }`}
              >
                <h3 className="font-semibold text-green-800">{n.title}</h3>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{n.body}</p>
                {n.aqiPriority && (
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      n.aqiPriority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : n.aqiPriority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {n.aqiPriority} AQI
                  </span>
                )}
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
