import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          Green Space Optimizer
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Join community cleaning drives. Clean unwanted land, plant trees, clean ponds.
          Reduce AQI and your carbon footprint. One drive per month, 3–4 hours — make a real impact.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/signup"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow"
          >
            Get Started
          </Link>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2">One drive, big impact</h3>
          <p className="text-gray-600 text-sm">Join one camp per month, max 3–4 hours. Contribute to society and live sustainably.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2">Earn coins & virtual jungle</h3>
          <p className="text-gray-600 text-sm">Track AQI and carbon reduced. Grow your virtual forest on your dashboard.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2">Daily sustainability tips</h3>
          <p className="text-gray-600 text-sm">Simple habits like steel bottles, home plants. Extra score for completing them.</p>
        </div>
      </section>
    </div>
  );
}
