import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { drivesApi, locationsApi } from '../services/api';
import DriveCard from '../components/DriveCard';

export default function Drives() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [priorityLocations, setPriorityLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([drivesApi.list({ status: 'scheduled' }), locationsApi.priority({ limit: 5 })])
      .then(([drivesData, locationsData]) => {
        setDrives(Array.isArray(drivesData) ? drivesData : []);
        setPriorityLocations(Array.isArray(locationsData) ? locationsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (id) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    drivesApi
      .join(id)
      .then(() => drivesApi.list({ status: 'scheduled' }).then(setDrives))
      .catch((err) => alert(err.message || 'Could not join'));
  };

  const handleLeave = (id) => {
    drivesApi
      .leave(id)
      .then(() => drivesApi.list({ status: 'scheduled' }).then(setDrives))
      .catch((err) => alert(err.message || 'Could not leave'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading drives...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Cleaning Drives</h1>
        <p className="text-gray-600 mb-6">
          Join one drive per month (max 3–4 hours). Team size up to 20. Sign in to join.
        </p>

        {priorityLocations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Priority locations (AI-ranked)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityLocations.slice(0, 6).map((loc) => (
                <div
                  key={loc._id}
                  className="bg-white rounded-lg shadow border border-green-200 p-4"
                >
                  <h3 className="font-semibold text-gray-800">{loc.name}</h3>
                  <p className="text-sm text-gray-600">Region: {loc.region}</p>
                  <p className="text-sm text-green-600">Priority score: {loc.priorityScore}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="text-xl font-semibold text-green-800 mb-4">Upcoming drives</h2>
        {drives.length === 0 ? (
          <p className="text-gray-600">No scheduled drives yet. Check back later or sign in as incharge to create one.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => (
              <DriveCard
                key={drive._id}
                drive={drive}
                user={user}
                onJoin={() => handleJoin(drive._id)}
                onLeave={() => handleLeave(drive._id)}
              />
            ))}
          </div>
        )}

        {!user && (
          <p className="mt-6 text-center">
            <Link to="/login" className="text-green-600 font-medium hover:underline">Login</Link> or{' '}
            <Link to="/signup" className="text-green-600 font-medium hover:underline">Sign up</Link> to join drives.
          </p>
        )}
      </div>
    </div>
  );
}
