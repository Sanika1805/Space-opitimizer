export default function StatsCard({ label, value, suffix, color }) {
  const colorClasses = {
    amber: 'text-amber-600',
    green: 'text-green-600',
    blue: 'text-blue-600'
  };
  const c = colorClasses[color] || 'text-gray-700';
  const suf = suffix !== undefined ? suffix : '';
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-green-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-2xl font-semibold ${c}`}>{value}{suf}</p>
    </div>
  );
}
