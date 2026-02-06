import { useState, useEffect } from 'react';
import { scoringApi, aiApi, aiPollApi, pollsApi } from '../services/api';
import VirtualJungle from '../components/VirtualJungle';
import StatsCard from '../components/StatsCard';
import HabitTip from '../components/HabitTip';

export default function Dashboard() {
  const [score, setScore] = useState(null);
  const [habit, setHabit] = useState(null);
  const [weekendDrive, setWeekendDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollResult, setPollResult] = useState(null);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollError, setPollError] = useState(null);

  useEffect(() => {
    Promise.all([scoringApi.getMyScore(), aiApi.dailyHabit(), pollsApi.getWeekendDrive()])
      .then(([scoreData, habitData, weekendData]) => {
        setScore(scoreData);
        setHabit(habitData);
        setWeekendDrive(weekendData || null);
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

  const handlePollResult = () => {
    setPollError(null);
    setPollResult(null);
    setPollLoading(true);
    const samplePollResults = { 'Area A': 25, 'Area B': 18, 'Area C': 12 };
    aiPollApi
      .submitPollResult(samplePollResults)
      .then((data) => setPollResult(data))
      .catch((err) => setPollError(err.message || 'Failed to get poll result'))
      .finally(() => setPollLoading(false));
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

        <section className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 border-green-200/80 p-6 mb-10">
          <h2 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
            <span role="img" aria-hidden="true">🗳️</span> Weekend drive (from polls)
          </h2>
          <p className="text-gray-600 mb-4">
            Polls run Mon–Fri; community votes for area. Result for the next weekend drive is shown below.
          </p>
          {weekendDrive ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="font-semibold text-green-800">This weekend&apos;s drive</p>
              <p className="text-green-700">Subregion: {weekendDrive.selectedArea}</p>
              {weekendDrive.selectedTimeSlot && (
                <p className="text-green-700">Time: {weekendDrive.selectedTimeSlot}</p>
              )}
              {weekendDrive.region && (
                <p className="text-sm text-gray-600">Region: {weekendDrive.region}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No weekend drive decided yet. Vote in Community (Mon–Fri) for subregion and time.</p>
          )}
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-gray-600 mb-2">Demo: try AI poll result</p>
            <button
              type="button"
              onClick={handlePollResult}
              disabled={pollLoading}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {pollLoading ? 'Getting result...' : 'Try poll result (demo)'}
            </button>
            {pollError && <p className="mt-2 text-red-600 text-sm">{pollError}</p>}
            {pollResult && (
              <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200 text-sm">
                <p className="font-semibold text-green-800">Selected area: {pollResult.selectedArea ?? '—'}</p>
                <p className="text-green-700">Confidence: {(pollResult.confidence ?? 0) * 100}%</p>
              </div>
            )}
          </div>
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
