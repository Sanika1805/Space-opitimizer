import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, locationsApi } from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TRANSPORT_OPTIONS = ['Walk / Cycle', 'Public transport', 'Car / Bike', 'Mixed'];
const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Non-vegetarian', 'Flexitarian'];
const RECYCLING_OPTIONS = ['Regularly', 'Sometimes', 'Rarely', 'Not yet'];
const ENERGY_OPTIONS = ['Solar / renewable', 'LED & mindful use', 'Standard', 'Planning to improve'];
const WATER_OPTIONS = ['Rainwater / reuse', 'Low-flow fixtures', 'Mindful use', 'Standard'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({
    area: '',
    region: '',
    mobile: '',
    bloodGroup: '',
    transportMode: '',
    dietPreference: '',
    recyclingHabit: '',
    energySaving: [],
    waterSaving: [],
    plantAtHome: false,
    reusableBags: false
  });

  const loadProfile = () => {
    if (user?.role === 'incharge') return;
    setLoading(true);
    setLoadError('');
    authApi
      .getMe()
      .then((data) => {
        if (data._id) {
          const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          setForm({
            area: data.area ?? '',
            region: data.region ?? (toArray(data.subscribedAreas)[0] ?? ''),
            mobile: data.mobile ?? '',
            bloodGroup: data.bloodGroup ?? '',
            transportMode: data.transportMode ?? '',
            dietPreference: data.dietPreference ?? '',
            recyclingHabit: data.recyclingHabit ?? '',
            energySaving: toArray(data.energySaving),
            waterSaving: toArray(data.waterSaving),
            plantAtHome: data.plantAtHome ?? false,
            reusableBags: data.reusableBags ?? false
          });
          setLoadError('');
        }
      })
      .catch((err) => setLoadError(err.message || 'Could not load profile.'))
      .finally(() => setLoading(false));
  };

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (user?.role === 'incharge') {
      navigate('/incharge/dashboard', { replace: true });
      return;
    }
    loadProfile();
  }, [user?.role, navigate]);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(() => []);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'region') next.area = '';
      return next;
    });
  };

  const subareasInRegion = form.region
    ? locations.filter((l) => l.region === form.region).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    : [];

  const handleMultiChange = (field, option, checked) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      const next = checked ? [...arr, option] : arr.filter((o) => o !== option);
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const payload = {
        ...form,
        subscribedAreas: form.region ? [form.region] : []
      };
      const updated = await authApi.updateProfile(payload);
      updateUser(updated);
      navigate('/dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === 'incharge') return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Complete your profile</h1>
        <p className="text-gray-600 mb-6">
          Add your details and sustainability choices so we can tailor your experience.
        </p>

        {loadError && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadProfile}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium text-sm whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-lg border border-green-200 p-6">
          <section>
            <h2 className="text-lg font-semibold text-green-800 mb-3">Basic info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select region</option>
                  {[...new Set(locations.map((l) => l.region).filter(Boolean))].sort().map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subarea</label>
                <select
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  disabled={!form.region}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-60 disabled:bg-gray-50"
                >
                  <option value="">Select subarea</option>
                  {subareasInRegion.map((loc) => (
                    <option key={loc._id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                {form.region && subareasInRegion.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No subareas in this region.</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Your community and alerts are based on Region and Subarea.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood group</label>
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-green-800 mb-3">Sustainability</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary transport</label>
                <select
                  name="transportMode"
                  value={form.transportMode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {TRANSPORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diet preference</label>
                <select
                  name="dietPreference"
                  value={form.dietPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {DIET_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recycling habit</label>
                <select
                  name="recyclingHabit"
                  value={form.recyclingHabit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {RECYCLING_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy saving</label>
                <div className="flex flex-wrap gap-3">
                  {ENERGY_OPTIONS.map((o) => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.energySaving.includes(o)}
                        onChange={(e) => handleMultiChange('energySaving', o, e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Water saving</label>
                <div className="flex flex-wrap gap-3">
                  {WATER_OPTIONS.map((o) => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.waterSaving.includes(o)}
                        onChange={(e) => handleMultiChange('waterSaving', o, e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="plantAtHome"
                    checked={form.plantAtHome}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Plants at home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="reusableBags"
                    checked={form.reusableBags}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Use reusable bags</span>
                </label>
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Back to dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
