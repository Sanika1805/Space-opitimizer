export default function VirtualJungle({ level, coins }) {
  const coinsNum = Number(coins) || 0;
  const levelNum = Number(level) || 0;
  const treesFromLevel = Math.min(levelNum, 30);
  const treesFromCoins = levelNum === 0 ? Math.min(6, Math.floor(coinsNum / 5)) : 0;
  const trees = Math.min(treesFromLevel + treesFromCoins, 30);
  const bushes = Math.min(Math.max(0, levelNum - 1), 10);
  const flowers = Math.min(Math.max(0, levelNum - 3), 15);
  const grassTufts = Math.max(10, Math.min(levelNum + 10, 20));
  const hasPond = levelNum >= 5;
  const hasPath = levelNum >= 2;
  const butterflies = levelNum >= 8 ? 3 : levelNum >= 4 ? 1 : 0;

  const treeTypes = ['🌳', '🌲', '🌴'];
  const getTree = (i) => treeTypes[i % treeTypes.length];

  const treePositions = [
    { left: '8%', bottom: '22%' }, { left: '22%', bottom: '18%' }, { left: '38%', bottom: '24%' },
    { left: '55%', bottom: '20%' }, { left: '72%', bottom: '22%' }, { left: '85%', bottom: '19%' },
    { left: '15%', bottom: '35%' }, { left: '45%', bottom: '38%' }, { left: '78%', bottom: '36%' },
    { left: '5%', bottom: '48%' }, { left: '30%', bottom: '52%' }, { left: '60%', bottom: '50%' }, { left: '90%', bottom: '48%' },
    { left: '18%', bottom: '62%' }, { left: '50%', bottom: '65%' }, { left: '82%', bottom: '60%' },
    { left: '10%', bottom: '75%' }, { left: '35%', bottom: '78%' }, { left: '65%', bottom: '76%' }, { left: '88%', bottom: '74%' },
    { left: '25%', bottom: '88%' }, { left: '55%', bottom: '90%' }, { left: '75%', bottom: '86%' },
    { left: '42%', bottom: '12%' }, { left: '68%', bottom: '14%' }, { left: '12%', bottom: '42%' },
    { left: '58%', bottom: '44%' }, { left: '28%', bottom: '28%' }, { left: '70%', bottom: '30%' }, { left: '48%', bottom: '55%' }
  ];

  const getTreeSize = (i) => {
    const base = levelNum <= 1 ? 1.1 : levelNum <= 4 ? 1.4 : levelNum <= 10 ? 1.8 : 2.2;
    const variation = (i % 3) * 0.15;
    return base + variation;
  };

  return (
    <div className="w-full min-h-[380px] rounded-2xl overflow-hidden border-2 border-green-400 shadow-inner relative flex flex-col bg-gradient-to-b from-sky-200/80 via-sky-100/50 to-emerald-50">
      {/* Sky layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300/40 via-transparent to-transparent h-1/3 rounded-t-2xl" aria-hidden="true" />
      {/* Distant hills / depth */}
      <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-green-600/20 via-transparent to-transparent rounded-b-2xl" aria-hidden="true" />

      {/* Lawn / ground – fills most of card */}
      <div className="absolute bottom-0 left-0 right-0 h-[72%] bg-gradient-to-t from-green-800/60 via-green-600/50 to-green-400/40 rounded-b-2xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-900/70 to-green-700/50 rounded-b-2xl" aria-hidden="true" />

      {/* Stone path – winds through garden */}
      {hasPath && (
        <>
          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-full bg-stone-300/70 z-[5] shadow-md" aria-hidden="true" />
          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[80%] h-2.5 rounded-full bg-amber-100/80 z-[5]" aria-hidden="true" />
        </>
      )}

      {/* Pond with reflection */}
      {hasPond && (
        <div className="absolute bottom-[22%] right-[8%] w-20 h-14 rounded-full bg-gradient-to-b from-blue-400/70 to-blue-600/80 border-2 border-blue-700/60 z-[6] flex items-center justify-center text-2xl shadow-lg" aria-hidden="true">
          💧
        </div>
      )}

      {/* Grass tufts – full width along bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-around px-2 z-[7] gap-1 flex-wrap">
        {Array.from({ length: grassTufts }).map((_, i) => (
          <span key={`g-${i}`} className="text-lg opacity-95 drop-shadow-sm" style={{ transform: `rotate(${(i % 5) * 6 - 12}deg)` }} role="img" aria-hidden="true">🌾</span>
        ))}
      </div>

      {/* Trees – positioned across full garden, sizes scale with level */}
      <div className="absolute inset-0 z-[4] pointer-events-none pt-2 pb-20">
        {Array.from({ length: trees }).map((_, i) => {
          const pos = treePositions[i % treePositions.length];
          const scale = getTreeSize(i);
          return (
            <span
              key={`t-${i}`}
              className="absolute drop-shadow-xl inline-block transition-all duration-500"
              style={{
                left: pos.left,
                bottom: pos.bottom,
                transform: `scale(${scale})`,
                fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)'
              }}
              role="img"
              aria-label="tree"
            >
              {getTree(i)}
            </span>
          );
        })}
      </div>

      {/* Bushes – mid layer */}
      {bushes > 0 && (
        <div className="absolute bottom-[28%] left-0 right-0 flex justify-around px-6 z-[6] gap-4">
          {Array.from({ length: bushes }).map((_, i) => (
            <span key={`b-${i}`} className="text-2xl drop-shadow-lg opacity-95" style={{ transform: `scale(${0.8 + (i % 3) * 0.2})` }} role="img" aria-hidden="true">🌿</span>
          ))}
        </div>
      )}

      {/* Flowers – foreground */}
      {flowers > 0 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-around px-4 z-[8] gap-2 flex-wrap">
          {Array.from({ length: flowers }).map((_, i) => (
            <span key={`f-${i}`} className="text-lg drop-shadow" role="img" aria-hidden="true">
              {['🌸', '🌼', '🌺', '🪷', '🌻'][i % 5]}
            </span>
          ))}
        </div>
      )}

      {/* Butterflies at higher levels */}
      {butterflies > 0 && (
        <div className="absolute top-8 left-0 right-0 flex justify-around px-8 z-10">
          {Array.from({ length: butterflies }).map((_, i) => (
            <span key={`bf-${i}`} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} role="img" aria-hidden="true">🦋</span>
          ))}
        </div>
      )}

      {/* Compact label bar – bottom of card */}
      <div className="relative z-20 mt-auto flex-shrink-0 bg-gradient-to-t from-green-900/50 via-green-800/30 to-transparent pt-5 pb-4 px-4 rounded-b-2xl">
        <p className="text-green-800 font-bold text-lg text-center drop-shadow-sm">Your virtual forest</p>
        <p className="text-green-700 text-sm text-center font-medium">{coinsNum} coins • Level {levelNum}</p>
        {trees === 0 && coinsNum === 0 && (
          <p className="text-green-600 text-sm text-center font-medium mt-2 bg-white/80 px-4 py-2 rounded-full inline-block w-full">
            Join drives and complete habits to grow your forest!
          </p>
        )}
        {trees > 0 && (levelNum === 0 || coinsNum < 50) && (
          <p className="text-green-600 text-xs text-center mt-1 opacity-90">
            Earn more coins to level up and grow more trees!
          </p>
        )}
      </div>
    </div>
  );
}
