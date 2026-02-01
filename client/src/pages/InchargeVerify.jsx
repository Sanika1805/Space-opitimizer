import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inchargesApi } from '../services/api';

export default function InchargeVerify() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    mobile: '',
    previousExperience: '',
    region: '',
    yearsExperience: '',
    emergencyContact: ''
  });
  const [certFiles, setCertFiles] = useState([]);

  useEffect(() => {
    if (user?.role !== 'incharge') {
      navigate('/dashboard', { replace: true });
      return;
    }
    inchargesApi
      .getProfile()
      .then((data) => {
        if (data._id && data.verificationSubmitted) {
          navigate('/incharge/dashboard', { replace: true });
          return;
        }
        if (data._id) {
          setForm({
            mobile: data.mobile ?? '',
            previousExperience: data.previousExperience ?? '',
            region: data.region ?? '',
            yearsExperience: data.yearsExperience ?? '',
            emergencyContact: data.emergencyContact ?? ''
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCertFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('mobile', form.mobile);
      formData.append('previousExperience', form.previousExperience);
      formData.append('region', form.region);
      formData.append('yearsExperience', form.yearsExperience);
      formData.append('emergencyContact', form.emergencyContact);
      certFiles.forEach((file) => formData.append('certifications', file));

      const data = await inchargesApi.submitVerification(formData);
      if (data._id || data.user) {
        navigate('/incharge/dashboard');
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit verification.');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'incharge') return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Incharge verification</h1>
        <p className="text-gray-600 mb-6">
          Complete the form below so we can verify you as an incharge. You can upload certificates (PDF, DOC, JPG, PNG).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-lg border border-green-200 p-6">
          <section>
            <h2 className="text-lg font-semibold text-green-800 mb-3">Contact & experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous experience</label>
                <textarea
                  name="previousExperience"
                  value={form.previousExperience}
                  onChange={handleChange}
                  placeholder="Describe your experience with drives, volunteering, or similar"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                <input
                  type="text"
                  name="yearsExperience"
                  value={form.yearsExperience}
                  onChange={handleChange}
                  placeholder="e.g. 2 years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region / area</label>
                <input
                  type="text"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore North"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  placeholder="Name and phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-green-800 mb-3">Certifications</h2>
            <p className="text-sm text-gray-600 mb-2">
              Upload any relevant certificates (first aid, safety, volunteering). Max 5 files, 5MB each. PDF, DOC, JPG, PNG.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-800 file:font-medium file:cursor-pointer hover:file:bg-green-200"
            />
            {certFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">{certFiles.length} file(s) selected</p>
            )}
          </section>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
