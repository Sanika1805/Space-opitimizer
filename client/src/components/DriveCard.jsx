export default function DriveCard({ drive, user, onJoin, onLeave }) {
  const locationName = drive.location?.name || 'Location';
  const dateStr = drive.date ? new Date(drive.date).toLocaleDateString() : '';
  const participants = drive.participants || [];
  const count = participants.length;
  const max = drive.maxParticipants || 20;
  const isJoined = user && participants.some((p) => (typeof p === 'object' ? p._id : p) === user._id);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-800">{locationName}</h3>
      <p className="text-sm text-gray-600 mt-1">{dateStr} • {drive.timeSlot || '09:00-12:00'}</p>
      <p className="text-sm text-green-600">{max - count} slots left ({count}/{max})</p>
      {drive.tasks && drive.tasks.length > 0 && (
        <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
          {drive.tasks.map((t, i) => (
            <li key={i}>{t.title}</li>
          ))}
        </ul>
      )}
      {user && (
        isJoined ? (
          <button
            onClick={onLeave}
            className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            Leave drive
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Join drive
          </button>
        )
      )}
    </div>
  );
}
