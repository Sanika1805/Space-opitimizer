import { useState, useEffect } from 'react';
import { scoringApi, aiApi } from '../services/api';
import VirtualJungle from '../components/VirtualJungle';
import StatsCard from '../components/StatsCard';
import HabitTip from '../components/HabitTip';

export default function Dashboard() {
  const [score, setScore] = useState(null);
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([scoringApi.getMyScore(), aiApi.dailyHabit()])
      .then(([scoreData, habitData]) => {
        setScore(scoreData);
        setHabit(habitData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = () => {
    const text = encodeURIComponent(
      `I'm contributing to a greener planet with Green Space Optimizer. Join me!`
    );
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50/80 to-teal-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-2 tracking-tight">My Impact</h1>
        <p className="text-gray-600 mb-8">Track your contributions to a greener planet</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatsCard
            label="Coins"
            value={score?.coins ?? 0}
            color="amber"
          />
          <StatsCard
            label="AQI Reduced"
            value={score?.aqiReduced ?? 0}
            suffix=""
            color="green"
          />
          <StatsCard
            label="Carbon Reduced"
            value={score?.carbonFootprintReducedKg ?? 0}
            suffix=" kg"
            color="blue"
          />
        </div>

        <section className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 border-green-200/80 p-6 mb-10">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <span role="img" aria-hidden="true">🌲</span> Virtual Jungle
          </h2>
          <VirtualJungle level={score?.virtualJungleLevel ?? 0} coins={score?.coins ?? 0} />
        </section>

        {habit && (
          <section className="mb-10">
            <HabitTip habit={habit} onComplete={() => scoringApi.completeHabit(habit.points).then(setScore)} />
          </section>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span role="img" aria-hidden="true">📤</span> Share my impact on social media
          </button>
        </div>
      </div>
    </div>
  );
}
