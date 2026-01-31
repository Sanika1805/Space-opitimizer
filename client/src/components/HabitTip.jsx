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
    <div className="bg-white rounded-xl shadow border border-green-200 p-6">
      <h2 className="text-xl font-semibold text-green-800 mb-2">Daily sustainability tip</h2>
      <p className="text-gray-700 mb-4">{habit.text}</p>
      <p className="text-sm text-green-600 mb-3">+{habit.points || 5} coins when you complete this</p>
      <button
        onClick={handleComplete}
        disabled={done}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {done ? 'Done' : 'I did this today'}
      </button>
    </div>
  );
}
