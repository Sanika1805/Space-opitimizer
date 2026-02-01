export default function StatsCard({ label, value, suffix, color }) {
  const colorStyles = {
    amber: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: '🪙'
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '🌬️'
    },
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: '🌍'
    }
  };
  const style = colorStyles[color] || { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: '•' };
  const suf = suffix !== undefined ? suffix : '';
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg p-5 border-2 ${style.border} ${style.bg} hover:shadow-xl transition-shadow duration-300`}>
      <span className="absolute top-3 right-3 text-2xl opacity-60" role="img" aria-hidden="true">{style.icon}</span>
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${style.text}`}>{value}{suf}</p>
    </div>
  );
}
