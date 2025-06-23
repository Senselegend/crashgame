import { UserStats } from '@shared/schema';

interface GameStatsProps {
  stats: UserStats;
}

export function GameStats({ stats }: GameStatsProps) {
  return (
    <div className="bg-game-darker/60 border border-game-purple/20 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-chart-line text-game-blue"></i>
        Statistics
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Win Rate</span>
          <span className="font-mono font-semibold text-game-green">
            {stats.winRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Max Win</span>
          <span className="font-mono font-semibold text-game-cyan">
            {stats.maxWin.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Max Multiplier</span>
          <span className="font-mono font-semibold text-game-cyan">
            ×{stats.maxMultiplier.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Total Played</span>
          <span className="font-mono font-semibold text-white">
            {stats.totalPlayed}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Net Profit</span>
          <span 
            className={`font-mono font-semibold ${
              stats.netProfit >= 0 ? 'text-game-green' : 'text-game-red'
            }`}
          >
            {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
