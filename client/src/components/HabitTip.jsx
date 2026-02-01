import { useState } from 'react';

export default function HabitTip({ habit, onComplete }) {
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    if (done) return;
    onComplete();
    setDone(true);
  };

  if (!habit) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full opacity-50" />
      <div className="relative z-10 flex items-start gap-3">
        <span className="text-3xl flex-shrink-0" role="img" aria-hidden="true">🌿</span>
        <div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Daily sustainability tip</h2>
          <p className="text-gray-700 mb-4 text-lg">{habit.text}</p>
          <p className="text-sm font-semibold text-green-600 mb-3">+{habit.points || 5} coins when you complete this</p>
          <button
            onClick={handleComplete}
            disabled={done}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
          >
            {done ? 'Done' : 'I did this today'}
          </button>
        </div>
      </div>
    </div>
  );
}
