import { useState, useEffect } from 'react';
import { inchargesApi, drivesApi, aiApi } from '../services/api';
import EmergencyChatbot from '../components/EmergencyChatbot';
import LinearRegressionInsight from '../components/LinearRegressionInsight';
import ClusterAnalysis from '../components/ClusterAnalysis';
import ClusteringVisualization from '../components/ClusteringVisualization';

export default function InchargeDashboard() {
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    inchargesApi
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
    drivesApi.list({ status: 'scheduled' }).then((data) => setDrives(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Incharge Dashboard</h1>

        {profile && (
          <div className="bg-white rounded-xl shadow border border-green-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your profile</h2>
            <p><span className="text-gray-600">Region:</span> {profile.region}</p>
            <p><span className="text-gray-600">Verified:</span> {profile.verified ? 'Yes' : 'Pending'}</p>
            {profile.pastWork && <p><span className="text-gray-600">Past work:</span> {profile.pastWork}</p>}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
          >
            {showChatbot ? 'Hide' : 'Show'} Emergency chatbot
          </button>
          <p className="text-sm text-gray-600 mt-1">Use for injuries, accidents, or urgent situations.</p>
        </div>

        {showChatbot && (
          <div className="bg-white rounded-xl shadow border border-green-200 p-6 mb-6">
            <EmergencyChatbot />
          </div>
        )}

        <section>
          <h2 className="text-xl font-semibold text-green-800 mb-4">Scheduled drives</h2>
          {drives.length === 0 ? (
            <p className="text-gray-600">No drives scheduled. Create drives from backend or admin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.map((d) => (
                <div key={d._id} className="bg-white rounded-lg shadow border p-4">
                  <h3 className="font-semibold">{d.location?.name || 'Location'}</h3>
                  <p className="text-sm text-gray-600">{new Date(d.date).toLocaleDateString()} • {d.timeSlot}</p>
                  <p className="text-sm text-green-600">{d.participants?.length || 0} / {d.maxParticipants} joined</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <LinearRegressionInsight />
        </section>

        <section className="mt-10">
          <ClusterAnalysis />
        </section>

        <section className="mt-10">
          <ClusteringVisualization />
        </section>
      </div>
    </div>
  );
}
