import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GameState, UserData } from '@shared/schema';
import { GameLogic } from '@/lib/game-logic';

interface GameControlsProps {
  gameState: GameState;
  userData: UserData;
  onStartGame: () => void;
  onCashOut: () => void;
  onUpdateBetAmount: (amount: number) => void;
  onUpdateAutoStop: (multiplier: number) => void;
}

export function GameControls({
  gameState,
  userData,
  onStartGame,
  onCashOut,
  onUpdateBetAmount,
  onUpdateAutoStop,
}: GameControlsProps) {
  const handleBetAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    onUpdateBetAmount(Math.max(GameLogic.MIN_BET, Math.min(userData.balance, amount)));
  };

  const handleAutoStopChange = (value: string) => {
    const multiplier = parseFloat(value) || GameLogic.MIN_MULTIPLIER;
    onUpdateAutoStop(Math.max(GameLogic.MIN_MULTIPLIER, Math.min(GameLogic.MAX_MULTIPLIER, multiplier)));
  };

  const setBetPreset = (type: 'min' | 'half' | 'double' | 'max') => {
    let newAmount: number;
    switch (type) {
      case 'min':
        newAmount = GameLogic.MIN_BET;
        break;
      case 'half':
        newAmount = Math.max(GameLogic.MIN_BET, Math.floor(gameState.betAmount / 2));
        break;
      case 'double':
        newAmount = Math.min(userData.balance, gameState.betAmount * 2);
        break;
      case 'max':
        newAmount = userData.balance;
        break;
    }
    onUpdateBetAmount(newAmount);
  };

  const setAutoStopPreset = (multiplier: number) => {
    onUpdateAutoStop(multiplier);
  };

  const potentialWin = GameLogic.calculateWinAmount(gameState.betAmount, gameState.autoStopMultiplier);

  return (
    <div className="bg-game-darker/60 border border-game-purple/20 rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Betting Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-coins text-game-cyan"></i>
            Place Your Bet
          </h3>
          
          <div>
            <Label className="block text-sm text-slate-400 mb-2">Bet Amount</Label>
            <div className="relative">
              <Input 
                type="number" 
                min={GameLogic.MIN_BET}
                max={userData.balance}
                value={gameState.betAmount}
                onChange={(e) => handleBetAmountChange(e.target.value)}
                className="w-full bg-game-dark border border-game-purple/30 rounded-lg px-4 py-3 font-mono text-lg focus:border-game-purple focus:ring-2 focus:ring-game-purple/20"
                disabled={gameState.isPlaying}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="fas fa-coins"></i>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBetPreset('min')}
                disabled={gameState.isPlaying}
                className="flex-1 bg-game-dark hover:bg-game-purple/20 border-game-purple/30 hover:border-game-purple/50"
              >
                Min
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBetPreset('half')}
                disabled={gameState.isPlaying}
                className="flex-1 bg-game-dark hover:bg-game-purple/20 border-game-purple/30 hover:border-game-purple/50"
              >
                1/2
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBetPreset('double')}
                disabled={gameState.isPlaying}
                className="flex-1 bg-game-dark hover:bg-game-purple/20 border-game-purple/30 hover:border-game-purple/50"
              >
                2x
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBetPreset('max')}
                disabled={gameState.isPlaying}
                className="flex-1 bg-game-dark hover:bg-game-purple/20 border-game-purple/30 hover:border-game-purple/50"
              >
                Max
              </Button>
            </div>
          </div>
        </div>

        {/* Auto-Stop Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-crosshairs text-game-green"></i>
            Auto-Stop
          </h3>
          
          <div>
            <Label className="block text-sm text-slate-400 mb-2">Stop at Multiplier</Label>
            <div className="relative">
              <Input 
                type="number" 
                min={GameLogic.MIN_MULTIPLIER}
                max={GameLogic.MAX_MULTIPLIER}
                step="0.01"
                value={gameState.autoStopMultiplier}
                onChange={(e) => handleAutoStopChange(e.target.value)}
                className="w-full bg-game-dark border border-game-green/30 rounded-lg px-4 py-3 font-mono text-lg focus:border-game-green focus:ring-2 focus:ring-game-green/20"
                disabled={gameState.isPlaying}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ×
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[1.5, 2, 5, 10].map((multiplier) => (
                <Button 
                  key={multiplier}
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAutoStopPreset(multiplier)}
                  disabled={gameState.isPlaying}
                  className="bg-game-dark hover:bg-game-green/20 border-game-green/30 hover:border-game-green/50 font-mono"
                >
                  ×{multiplier}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Action Buttons */}
      <div className="mt-6 pt-6 border-t border-game-purple/20">
        <div className="flex gap-4">
          <Button 
            onClick={onStartGame}
            disabled={gameState.isPlaying || !GameLogic.isValidBet(gameState.betAmount, userData.balance)}
            className="flex-1 bg-gradient-to-r from-game-blue to-game-purple hover:from-game-blue/90 hover:to-game-purple/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-game-purple/25 animate-pulse-neon"
          >
            <i className="fas fa-rocket mr-3"></i>
            START FLIGHT
          </Button>
          
          <Button 
            onClick={onCashOut}
            disabled={!gameState.canCashOut || !gameState.isPlaying}
            className="flex-1 bg-gradient-to-r from-game-green to-emerald-600 hover:from-game-green/90 hover:to-emerald-600/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-game-green/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-hand-paper mr-3"></i>
            CASH OUT
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">Potential Win:</p>
          <p className="text-xl font-mono font-bold text-game-cyan">
            {potentialWin.toLocaleString()} credits
          </p>
        </div>
      </div>
    </div>
  );
}
