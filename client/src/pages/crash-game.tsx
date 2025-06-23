import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GameCanvas } from '@/components/game-canvas';
import { GameControls } from '@/components/game-controls';
import { GameHistory } from '@/components/game-history';
import { GameStats } from '@/components/game-stats';
import { AchievementsModal } from '@/components/achievements-modal';
import { CustomizationModal } from '@/components/customization-modal';
import { ShareModal } from '@/components/share-modal';
import { useGameState } from '@/hooks/use-game-state';
import { useCustomization } from '@/hooks/use-customization';

export default function CrashGame() {
  const {
    userData,
    gameHistory,
    gameState,
    winStreak,
    startGame,
    cashOut,
    claimDailyBonus,
    updateBetAmount,
    updateAutoStopMultiplier,
    canClaimDailyBonus,
    isLuckyHour,
  } = useGameState();

  const { getCurrentSkin, getCurrentTheme } = useCustomization();
  const [rocketStyle, setRocketStyle] = useState({ left: '60px', bottom: '60px' });
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  const currentSkin = getCurrentSkin();
  const currentTheme = getCurrentTheme();

  // Update spaceship position to follow the curve smoothly
  useEffect(() => {
    if (gameState.isPlaying && gameState.startTime) {
      const updateSpaceship = () => {
        const position = (window as any).rocketPosition;
        if (position) {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            setRocketStyle({
              left: `${position.x}px`,
              bottom: `${rect.height - position.y}px`,
            });
          }
        }
      };

      const interval = setInterval(updateSpaceship, 16); // 60fps for smoothest animation
      return () => clearInterval(interval);
    } else {
      // Smoothly return to starting position after game ends
      const returnToStart = () => {
        setRocketStyle({ left: '60px', bottom: '60px' });
      };
      
      // Delay the return animation slightly for better visual flow
      const timeout = setTimeout(returnToStart, gameState.isPlaying ? 0 : 600);
      return () => clearTimeout(timeout);
    }
  }, [gameState.isPlaying, gameState.startTime]);

  // Listen for big win events
  useEffect(() => {
    const handleBigWin = (event: any) => {
      setShareData(event.detail);
      setShowShare(true);
    };

    window.addEventListener('bigWin', handleBigWin);
    return () => window.removeEventListener('bigWin', handleBigWin);
  }, []);

  const getGameStatus = () => {
    if (gameState.isPlaying) {
      return { text: 'Flying...', className: 'text-game-cyan' };
    }
    return { text: 'Ready to Fly', className: 'text-game-cyan' };
  };

  const status = getGameStatus();

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-game-dark via-game-darker to-game-dark"
      style={{
        '--theme-primary': currentTheme.colors.primary,
        '--theme-secondary': currentTheme.colors.secondary,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-game-darker/80 backdrop-blur-sm border-b border-game-purple/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-game-purple to-game-blue rounded-full flex items-center justify-center">
                  <span className="text-lg">{currentSkin.emoji}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CrashGame</h1>
                  <p className="text-xs text-slate-400">Demo Mode</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="bg-game-purple/10 border border-game-purple/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-medal text-game-purple text-sm"></i>
                    <span className="text-sm font-mono">Level {userData.level}</span>
                  </div>
                </div>
                
                {winStreak > 0 && (
                  <div className="bg-game-green/10 border border-game-green/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-fire text-game-green text-sm"></i>
                      <span className="text-sm font-mono">{winStreak} streak</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAchievements(true)}
                variant="outline"
                size="sm"
                className="border-game-purple/30 hover:bg-game-purple/20"
              >
                <i className="fas fa-trophy mr-2"></i>
                <span className="hidden sm:inline">Achievements</span>
              </Button>
              
              <Button
                onClick={() => setShowCustomization(true)}
                variant="outline"
                size="sm"
                className="border-game-purple/30 hover:bg-game-purple/20"
              >
                <i className="fas fa-palette mr-2"></i>
                <span className="hidden sm:inline">Customize</span>
              </Button>

              <div className="bg-gradient-to-r from-game-purple/20 to-game-blue/20 border border-game-purple/30 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-coins text-game-cyan text-lg"></i>
                  <div>
                    <p className="text-xs text-slate-400">Balance</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {userData.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={claimDailyBonus}
                disabled={!canClaimDailyBonus}
                className="bg-gradient-to-r from-game-green to-emerald-600 hover:from-game-green/90 hover:to-emerald-600/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-game-green/25 disabled:opacity-50"
              >
                <i className="fas fa-gift mr-2"></i>
                <span className="hidden sm:inline">
                  {isLuckyHour ? 'Lucky Bonus' : 'Daily Bonus'}
                </span>
                <span className="sm:hidden">Bonus</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <GameHistory history={gameHistory} />
              <GameStats stats={userData.stats} />
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-6">
              
              {/* Game Visualization */}
              <div className="bg-game-darker/60 border border-game-purple/20 rounded-xl overflow-hidden">
                <div className="relative h-96 md:h-[500px]">
                  <GameCanvas gameState={gameState} />
                  
                  {/* Game Status Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm text-slate-400 mb-1">Current Multiplier</p>
                      <p className="text-3xl md:text-4xl font-mono font-bold text-white">
                        ×{gameState.currentMultiplier.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-400 mb-1">Game Status</p>
                      <p className={`text-lg font-semibold ${status.className}`}>
                        {status.text}
                      </p>
                    </div>
                  </div>

                  {/* Spaceship Element */}
                  <div 
                    className="absolute transition-all duration-75 ease-linear z-10"
                    style={rocketStyle}
                  >
                    <div className={`text-3xl ${gameState.isPlaying ? 'animate-rocket-fly' : ''} filter drop-shadow-lg transform -translate-x-1/2 -translate-y-1/2`}>
                      {currentSkin.emoji}
                    </div>
                  </div>

                  {/* Game Timer Progress */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-game-dark/50">
                    <div 
                      className="h-full bg-gradient-to-r from-game-blue to-game-purple transition-all duration-100 ease-linear"
                      style={{ 
                        width: gameState.isPlaying && gameState.startTime 
                          ? `${Math.min((Date.now() - gameState.startTime) / 150, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <GameControls
                gameState={gameState}
                userData={userData}
                onStartGame={startGame}
                onCashOut={cashOut}
                onUpdateBetAmount={updateBetAmount}
                onUpdateAutoStop={updateAutoStopMultiplier}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AchievementsModal 
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
      
      <CustomizationModal 
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
        userData={userData}
      />
      
      {shareData && (
        <ShareModal 
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          winAmount={shareData.winAmount}
          multiplier={shareData.multiplier}
          betAmount={shareData.betAmount}
        />
      )}
    </div>
  );
}
