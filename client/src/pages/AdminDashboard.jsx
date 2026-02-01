import { useState, useEffect } from 'react';
import { inchargesApi } from '../services/api';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [verifying, setVerifying] = useState(null);

  const loadPending = () => inchargesApi.list({ pending: 'true' }).then(setPending).catch(() => []);
  const loadAll = () => inchargesApi.list().then(setAll).catch(() => []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPending(), loadAll()]).finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      await inchargesApi.verify(id);
      setDetail(null);
      await loadPending();
      await loadAll();
    } catch (err) {
      alert(err.message || 'Failed to verify');
    } finally {
      setVerifying(null);
    }
  };

  const showDetail = async (id) => {
    try {
      const data = await inchargesApi.getById(id);
      setDetail(data);
    } catch (err) {
      alert(err.message || 'Failed to load');
    }
  };

  const list = tab === 'pending' ? pending : all;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Admin – Incharge verification</h1>
        <p className="text-gray-600 mb-6">
          Review incharges who submitted verification. Approve them so they are marked as verified.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'pending' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-green-200'
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-green-200'
            }`}
          >
            All incharges ({all.length})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
          {list.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {tab === 'pending' ? 'No pending incharges.' : 'No incharges yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-green-100">
              {list.map((inc) => (
                <li key={inc._id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-green-800">{inc.user?.name}</p>
                    <p className="text-sm text-gray-600">{inc.user?.email}</p>
                    {inc.region && <p className="text-sm text-gray-500">Region: {inc.region}</p>}
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                        inc.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => showDetail(inc._id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      View details
                    </button>
                    {!inc.verified && (
                      <button
                        type="button"
                        onClick={() => handleVerify(inc._id)}
                        disabled={verifying === inc._id}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {verifying === inc._id ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detail && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10"
            onClick={() => setDetail(null)}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-green-800">Incharge details</h2>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium">{detail.user?.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd>{detail.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Mobile</dt>
                  <dd>{detail.mobile || '–'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Region</dt>
                  <dd>{detail.region || '–'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Years of experience</dt>
                  <dd>{detail.yearsExperience || '–'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Emergency contact</dt>
                  <dd>{detail.emergencyContact || '–'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Previous experience</dt>
                  <dd className="whitespace-pre-wrap">{detail.previousExperience || '–'}</dd>
                </div>
                {detail.certifications?.length > 0 && (
                  <div>
                    <dt className="text-gray-500">Certifications</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {detail.certifications.map((path, i) => (
                        <a
                          key={i}
                          href={path.startsWith('http') ? path : path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          File {i + 1}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              {!detail.verified && (
                <button
                  type="button"
                  onClick={() => handleVerify(detail._id)}
                  disabled={verifying === detail._id}
                  className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {verifying === detail._id ? 'Verifying...' : 'Verify this incharge'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
