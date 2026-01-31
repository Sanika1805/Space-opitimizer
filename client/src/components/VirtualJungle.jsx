export default function VirtualJungle({ level, coins }) {
  const trees = Math.min(level, 20);
  return (
    <div className="h-48 rounded-lg bg-green-100 border-2 border-green-300 flex flex-col items-center justify-center p-4">
      <p className="text-green-800 font-semibold mb-2">Your virtual forest</p>
      <p className="text-green-700 text-sm mb-2">{coins} coins • Level {level}</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {Array.from({ length: trees }).map((_, i) => (
          <span key={i} className="text-2xl" role="img" aria-label="tree">🌳</span>
        ))}
        {trees === 0 && <span className="text-gray-500 text-sm">Join drives and complete habits to grow your forest!</span>}
      </div>
    </div>
  );
}
