import { GameResult } from '@shared/schema';

interface GameHistoryProps {
  history: GameResult[];
}

export function GameHistory({ history }: GameHistoryProps) {
  return (
    <div className="bg-game-darker/60 border border-game-purple/20 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-history text-game-purple"></i>
        Game History
      </h3>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 py-4">
            <i className="fas fa-clock text-2xl mb-2"></i>
            <p>No games played yet</p>
          </div>
        ) : (
          history.map((result) => (
            <div 
              key={result.id} 
              className="flex items-center justify-between p-2 bg-game-dark/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span 
                  className={`font-mono text-sm ${
                    result.isWin ? 'text-game-green' : 'text-game-red'
                  }`}
                >
                  ×{result.multiplier.toFixed(2)}
                </span>
                {result.isAuto && (
                  <span className="text-xs bg-game-blue/20 text-game-blue px-1 rounded">
                    AUTO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {result.isWin ? `+${result.winAmount}` : `-${result.betAmount}`}
                </span>
                <i 
                  className={`fas fa-circle text-xs ${
                    result.isWin ? 'text-game-green' : 'text-game-red'
                  }`}
                ></i>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
