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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-6">My Impact</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        <section className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Virtual Jungle</h2>
          <VirtualJungle level={score?.virtualJungleLevel ?? 0} coins={score?.coins ?? 0} />
        </section>

        {habit && (
          <section className="mb-8">
            <HabitTip habit={habit} onComplete={() => scoringApi.completeHabit(habit.points).then(setScore)} />
          </section>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Share my impact on social media
          </button>
        </div>
      </div>
    </div>
  );
}
