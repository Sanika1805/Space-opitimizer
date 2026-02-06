import { useState, useEffect } from 'react';
import { communityApi, pollsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS_POLL = ['8-11 AM', '12-3 PM', '4-6 PM'];

function PollVoteForm({ poll, setPoll, setPollError, voteLoading, setVoteLoading, loadData }) {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedArea || !selectedTimeSlot) return;
    setPollError('');
    setVoteLoading(true);
    pollsApi.vote(poll._id, selectedArea, selectedTimeSlot).then((res) => {
      setPoll((p) => p ? { ...p, voteCounts: res.voteCounts, voteCountsByTime: res.voteCountsByTime || {}, myVote: res.myVote } : p);
      loadData();
    }).catch((err) => setPollError(err.message || 'Failed to submit vote')).finally(() => setVoteLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-green-800">Pick the top-priority subregion to clean (3 options) and when you’re available:</p>
      <div className="space-y-2">
        {(poll.areas || []).map((a) => (
          <label key={a.name} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pollArea" value={a.name} checked={selectedArea === a.name} onChange={() => setSelectedArea(a.name)} className="text-green-600" />
            <span>{a.name}</span>
          </label>
        ))}
      </div>
      <p className="text-sm font-medium text-green-800 mt-3">Time available to clean:</p>
      <div className="space-y-2">
        {(poll.timeSlots || TIME_SLOTS_POLL).map((slot) => (
          <label key={slot} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pollTime" value={slot} checked={selectedTimeSlot === slot} onChange={() => setSelectedTimeSlot(slot)} className="text-green-600" />
            <span>{slot}</span>
          </label>
        ))}
      </div>
      <button type="submit" disabled={!selectedArea || !selectedTimeSlot || voteLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
        {voteLoading ? 'Submitting...' : 'Submit vote'}
      </button>
    </form>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [areas, setAreas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
  const [voteLoading, setVoteLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [selectedAreaForPoll, setSelectedAreaForPoll] = useState('');
  const [closedResult, setClosedResult] = useState(null);

  function loadData() {
    setLoading(true);
    setError('');
    setPollError('');
    Promise.all([communityApi.getMyPosts(), pollsApi.getActive()])
      .then(([data, activePoll]) => {
        setAreas(data.areas || []);
        setPosts(data.posts || []);
        setPoll(activePoll);
        if (!selectedAreaForPoll && (data.areas || []).length > 0) {
          setSelectedAreaForPoll((prev) => prev || (data.areas[0] ?? ''));
        }
      })
      .catch((err) => {
        setError(err.message || 'Could not load community');
        setAreas([]);
        setPosts([]);
        setPoll(null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Your Community</h1>
        <p className="text-gray-600 mb-2">
          Based on your profile: {areas.length > 0 ? areas.join(', ') : 'no area set'}.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Users and incharges in these areas. Only AI shares alerts and drive instructions here.
        </p>

        {closedResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <p className="font-semibold">Poll closed</p>
            <p className="text-sm">Selected for next weekend drive: {closedResult.selectedArea}{closedResult.selectedTimeSlot ? ` at ${closedResult.selectedTimeSlot}` : ''} (confidence {(closedResult.confidence * 100)}%)</p>
          </div>
        )}

        <section className="bg-white/90 rounded-2xl shadow-lg border-2 border-green-200/80 p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
            <span role="img" aria-hidden="true">🗳️</span> Drive location poll
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Polls run Monday–Friday. Each area has its own poll with the top 3 highest-priority subregions to clean. Vote for subregion and your time available to clean. Result decides the next weekend drive for that area.
          </p>
          {pollError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {pollError}
            </div>
          )}
          {!poll && areas.length > 0 && !loading && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Create a poll for one of your areas. Options will be the highest-priority subregions to clean in that area:</p>
              <select
                value={selectedAreaForPoll}
                onChange={(e) => setSelectedAreaForPoll(e.target.value)}
                className="border border-green-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedAreaForPoll || generateLoading}
                onClick={() => {
                  setPollError('');
                  setGenerateLoading(true);
                  pollsApi.generate(selectedAreaForPoll).then(() => { setClosedResult(null); loadData(); }).catch((err) => setPollError(err.message || 'Failed to create poll')).finally(() => setGenerateLoading(false));
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {generateLoading ? 'Creating...' : `Generate poll for ${selectedAreaForPoll || 'area'}`}
              </button>
            </div>
          )}
          {poll && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Region: <strong>{poll.region}</strong></p>
              {poll.myVote ? (
                <p className="text-green-700 font-medium">
                  You voted for: {typeof poll.myVote === 'object' ? `${poll.myVote.areaName} at ${poll.myVote.timeSlot || ''}` : poll.myVote}
                </p>
              ) : (
                <PollVoteForm poll={poll} setPoll={setPoll} setPollError={setPollError} voteLoading={voteLoading} setVoteLoading={setVoteLoading} loadData={loadData} />
              )}
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Votes so far (subregion):</p>
                <ul className="list-disc list-inside">
                  {(poll.areas || []).map((a) => (
                    <li key={a.name}>{a.name}: {poll.voteCounts?.[a.name] ?? 0}</li>
                  ))}
                </ul>
                {poll.voteCountsByTime && (
                  <>
                    <p className="font-medium mb-1 mt-2">Time available:</p>
                    <ul className="list-disc list-inside">
                      {(poll.timeSlots || TIME_SLOTS_POLL).map((slot) => (
                        <li key={slot}>{slot}: {poll.voteCountsByTime[slot] ?? 0}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              {(user && (user.role === 'incharge' || user.role === 'admin')) && (
                <button
                  type="button"
                  onClick={() => {
                    setPollError('');
                    pollsApi.close(poll._id).then((res) => { setClosedResult(res); loadData(); }).catch((err) => setPollError(err.message || 'Failed to close poll'));
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
                >
                  Close poll and set drive location
                </button>
              )}
            </div>
          )}
          {areas.length === 0 && !loading && (
            <p className="text-gray-500 text-sm">Complete your profile with a region or area to see and create polls.</p>
          )}
        </section>

        {areas.length === 0 && !loading && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            Complete your Profile (Region or Area communities) or, if you are incharge, set your region so your community feed appears here.
          </div>
        )}

        <section className="bg-white/90 rounded-2xl shadow-lg border-2 border-green-200/80 p-4 md:p-6">
          <h2 className="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
            <span role="img" aria-hidden="true">🤖</span> AI Communication
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Alerts and drive instructions – shared by AI only. What to do and how to do it.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-green-700 py-8 text-center">Loading...</p>
          ) : posts.length === 0 ? (
            <>
              <div className="py-4 text-center text-gray-500 rounded-xl bg-green-50/50 mb-6">
                No AI posts yet for your area(s). Area alerts and new drives will appear here with instructions.
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo – for reference</p>
              <div className="space-y-6 opacity-90">
                <article className="border-l-4 border-amber-400 pl-4 py-3 rounded-r-lg bg-amber-50/50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium text-green-700">Area alert</span>
                    <span className="px-2 py-0.5 bg-green-200/80 text-green-800 rounded">Katraj</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">Medium AQI</span>
                    <span>Demo</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">⚠ Medium AQI: Katraj Lake</h3>
                  <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">⚠ Medium AQI Warning\nArea: Katraj Lake\nAQI: 145\nPriority: Medium\nMonitor and plan cleaning if needed.</p>
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-green-800 mb-1">What to do</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                      <li>Clean area and collect waste</li>
                      <li>Plant trees/saplings</li>
                      <li>Segregate and dispose waste properly</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 mb-1">How to do it</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                      <li>Wear gloves and closed shoes. Bring a bag for waste.</li>
                      <li>Work in pairs for safety. Stay within visible range of the group.</li>
                      <li>Separate plastic, metal and organic waste if bins are available.</li>
                      <li>Report any injury or hazard to the incharge immediately.</li>
                    </ul>
                  </div>
                </article>
                <article className="border-l-4 border-amber-400 pl-4 py-3 rounded-r-lg bg-amber-50/50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium text-green-700">Drive instructions</span>
                    <span className="px-2 py-0.5 bg-green-200/80 text-green-800 rounded">Katraj</span>
                    <span>Demo</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">Drive instructions: Rajiv Gandhi Zoo – Sun, 15 Mar 2026 09:00–12:00</h3>
                  <p className="text-gray-700 text-sm mb-3">Cleaning drive at Rajiv Gandhi Zoo. Follow the instructions below.</p>
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-green-800 mb-1">What to do</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                      <li>Clean area and collect waste</li>
                      <li>Plant trees/saplings</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 mb-1">How to do it</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                      <li>Wear gloves and closed shoes. Bring a bag for waste.</li>
                      <li>Water saplings after planting. Do not uproot or damage existing plants.</li>
                      <li>Report any injury or hazard to the incharge immediately.</li>
                    </ul>
                  </div>
                </article>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="border-l-4 border-green-500 pl-4 py-3 rounded-r-lg bg-green-50/50"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium text-green-700">{post.type === 'area_alert' ? 'Area alert' : 'Drive instructions'}</span>
                    {post.region && <span className="px-2 py-0.5 bg-green-200/80 text-green-800 rounded">{post.region}</span>}
                    {post.aqiPriority && (
                      <span
                        className={`px-2 py-0.5 rounded ${
                          post.aqiPriority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : post.aqiPriority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {post.aqiPriority} AQI
                      </span>
                    )}
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">{post.title}</h3>
                  {post.body && <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{post.body}</p>}
                  {Array.isArray(post.whatToDo) && post.whatToDo.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-green-800 mb-1">What to do</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                        {post.whatToDo.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(post.howToDo) && post.howToDo.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 mb-1">How to do it</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                        {post.howToDo.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
