import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameResult, UserData, UserStats } from '@shared/schema';
import { useLocalStorage } from './use-local-storage';
import { GameLogic } from '@/lib/game-logic';
import { CryptoRNG } from '@/lib/crypto-rng';
import { useToast } from '@/hooks/use-toast';

const initialUserData: UserData = {
  balance: 10000,
  level: 1,
  totalWagered: 0,
  lastDailyBonus: 0,
  consecutiveLosses: 0,
  stats: {
    totalPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    maxWin: 0,
    maxMultiplier: 0,
    netProfit: 0,
    totalWagered: 0,
  },
};

const initialGameState: GameState = {
  isPlaying: false,
  currentMultiplier: 1.0,
  betAmount: 100,
  autoStopMultiplier: 2.0,
  canCashOut: false,
};

export function useGameState() {
  const [userData, setUserData] = useLocalStorage<UserData>('crashgame-user', initialUserData);
  const [gameHistory, setGameHistory] = useLocalStorage<GameResult[]>('crashgame-history', []);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  const { toast } = useToast();
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const crashPointRef = useRef<number>();

  const updateUserStats = useCallback((result: GameResult, userData: UserData): UserStats => {
    const stats = { ...userData.stats };
    
    stats.totalPlayed += 1;
    stats.totalWagered += result.betAmount;
    
    if (result.isWin) {
      stats.totalWins += 1;
      stats.netProfit += (result.winAmount || 0) - result.betAmount;
      if (result.multiplier > stats.maxMultiplier) {
        stats.maxMultiplier = result.multiplier;
      }
      if ((result.winAmount || 0) > stats.maxWin) {
        stats.maxWin = result.winAmount || 0;
      }
    } else {
      stats.totalLosses += 1;
      stats.netProfit -= result.betAmount;
    }
    
    stats.winRate = stats.totalPlayed > 0 ? (stats.totalWins / stats.totalPlayed) * 100 : 0;
    
    return stats;
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    toast({
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  const startGame = useCallback(() => {
    if (gameState.isPlaying) return;

    if (!GameLogic.isValidBet(gameState.betAmount, userData.balance)) {
      showNotification('Invalid bet amount!', 'error');
      return;
    }

    const crashPoint = CryptoRNG.generateCrashPoint();
    crashPointRef.current = crashPoint;
    startTimeRef.current = Date.now();

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentMultiplier: 1.0,
      crashPoint,
      startTime: startTimeRef.current,
      canCashOut: false,
    }));

    // Start game loop
    const gameLoop = () => {
      const elapsed = Date.now() - startTimeRef.current!;
      const multiplier = GameLogic.calculateMultiplier(elapsed);
      
      setGameState(prev => ({
        ...prev,
        currentMultiplier: multiplier,
        canCashOut: multiplier >= 1.01,
      }));

      // Check for crash
      if (multiplier >= crashPointRef.current!) {
        endGame(false, multiplier);
        return;
      }

      // Check for auto-stop
      if (multiplier >= gameState.autoStopMultiplier) {
        endGame(true, multiplier, true);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, userData.balance, showNotification]);

  const cashOut = useCallback(() => {
    if (!gameState.isPlaying || !gameState.canCashOut) return;
    endGame(true, gameState.currentMultiplier, false);
  }, [gameState]);

  const endGame = useCallback((isWin: boolean, finalMultiplier: number, isAuto = false) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }

    const winAmount = isWin ? GameLogic.calculateWinAmount(gameState.betAmount, finalMultiplier) : 0;
    const profit = winAmount - gameState.betAmount;

    const result: GameResult = {
      id: Date.now().toString(),
      multiplier: finalMultiplier,
      isWin,
      betAmount: gameState.betAmount,
      winAmount: isWin ? winAmount : undefined,
      timestamp: Date.now(),
      isAuto,
    };

    // Update user data
    setUserData(prev => {
      const newStats = updateUserStats(result, prev);
      const newBalance = prev.balance + profit;
      const newTotalWagered = prev.totalWagered + gameState.betAmount;
      const newLevel = GameLogic.calculateLevel(newTotalWagered);
      const newConsecutiveLosses = isWin ? 0 : prev.consecutiveLosses + 1;

      // Check for level up
      if (newLevel > prev.level) {
        const reward = GameLogic.calculateLevelReward(newLevel);
        showNotification(`Level up! You reached level ${newLevel} and earned ${reward} credits!`, 'success');
        return {
          ...prev,
          balance: newBalance + reward,
          level: newLevel,
          totalWagered: newTotalWagered,
          consecutiveLosses: newConsecutiveLosses,
          stats: newStats,
        };
      }

      // Check for insurance
      if (!isWin && GameLogic.shouldTriggerInsurance(newConsecutiveLosses)) {
        const insurance = GameLogic.calculateInsuranceAmount(gameState.betAmount);
        showNotification(`Insurance activated! You received ${insurance} credits back.`, 'info');
        return {
          ...prev,
          balance: newBalance + insurance,
          totalWagered: newTotalWagered,
          consecutiveLosses: newConsecutiveLosses,
          stats: newStats,
        };
      }

      return {
        ...prev,
        balance: newBalance,
        totalWagered: newTotalWagered,
        consecutiveLosses: newConsecutiveLosses,
        stats: newStats,
      };
    });

    // Update game history
    setGameHistory(prev => [result, ...prev.slice(0, 19)]);

    // Show result notification
    if (isWin) {
      showNotification(
        `${isAuto ? 'Auto ' : ''}Cash out! Won ${winAmount} credits at ×${finalMultiplier.toFixed(2)}`,
        'success'
      );
    } else {
      showNotification(
        `Crashed at ×${finalMultiplier.toFixed(2)}! Lost ${gameState.betAmount} credits`,
        'error'
      );
    }

    // Reset game state
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      canCashOut: false,
      currentMultiplier: 1.0,
      crashPoint: undefined,
      startTime: undefined,
    }));
  }, [gameState, setUserData, setGameHistory, updateUserStats, showNotification]);

  const claimDailyBonus = useCallback(() => {
    if (!GameLogic.canClaimDailyBonus(userData.lastDailyBonus)) {
      showNotification('Daily bonus already claimed! Come back tomorrow.', 'error');
      return;
    }

    const bonusAmount = GameLogic.getDailyBonusAmount();
    const multiplier = GameLogic.isLuckyHour() ? GameLogic.getLuckyHourMultiplier() : 1;
    const finalBonus = bonusAmount * multiplier;

    setUserData(prev => ({
      ...prev,
      balance: prev.balance + finalBonus,
      lastDailyBonus: Date.now(),
    }));

    const message = multiplier > 1 
      ? `Lucky Hour! Daily bonus doubled: +${finalBonus} credits!`
      : `Daily bonus claimed: +${finalBonus} credits!`;
    
    showNotification(message, 'success');
  }, [userData.lastDailyBonus, setUserData, showNotification]);

  const updateBetAmount = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, betAmount: amount }));
  }, []);

  const updateAutoStopMultiplier = useCallback((multiplier: number) => {
    setGameState(prev => ({ ...prev, autoStopMultiplier: multiplier }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return {
    userData,
    gameHistory,
    gameState,
    startGame,
    cashOut,
    claimDailyBonus,
    updateBetAmount,
    updateAutoStopMultiplier,
    canClaimDailyBonus: GameLogic.canClaimDailyBonus(userData.lastDailyBonus),
    isLuckyHour: GameLogic.isLuckyHour(),
  };
}
