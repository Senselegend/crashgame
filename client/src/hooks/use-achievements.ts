import { useState, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { achievementDefinitions } from '@shared/schema';
import { useToast } from './use-toast';

interface AchievementProgress {
  [key: string]: {
    unlocked: boolean;
    progress: number;
    unlockedAt?: number;
  };
}

export function useAchievements() {
  const [achievements, setAchievements] = useLocalStorage<AchievementProgress>('achievements', {});
  const { toast } = useToast();

  const checkAchievement = useCallback((achievementId: string, currentValue: number) => {
    const definition = achievementDefinitions[achievementId as keyof typeof achievementDefinitions];
    if (!definition) return false;

    const current = achievements[achievementId] || { unlocked: false, progress: 0 };
    if (current.unlocked) return false;

    let requirement = 0;
    switch (definition.requirement.type) {
      case 'wins':
      case 'losses':
      case 'win_streak':
        requirement = definition.requirement.count;
        break;
      case 'single_win':
      case 'bet_amount':
      case 'multiplier':
      case 'level':
        requirement = definition.requirement.amount;
        break;
    }

    if (currentValue >= requirement) {
      setAchievements(prev => ({
        ...prev,
        [achievementId]: {
          unlocked: true,
          progress: requirement,
          unlockedAt: Date.now()
        }
      }));

      // Show achievement notification
      toast({
        title: '🏆 Achievement Unlocked!',
        description: `${definition.name}: ${definition.description}`,
        duration: 5000,
      });

      return true;
    } else {
      // Update progress
      setAchievements(prev => ({
        ...prev,
        [achievementId]: {
          ...current,
          progress: currentValue
        }
      }));
    }

    return false;
  }, [achievements, setAchievements, toast]);

  const getUnlockedAchievements = useCallback(() => {
    return Object.entries(achievements)
      .filter(([_, data]) => data.unlocked)
      .map(([id, data]) => ({
        id,
        ...achievementDefinitions[id as keyof typeof achievementDefinitions],
        unlockedAt: data.unlockedAt
      }));
  }, [achievements]);

  const getAchievementProgress = useCallback((achievementId: string) => {
    const current = achievements[achievementId] || { unlocked: false, progress: 0 };
    const definition = achievementDefinitions[achievementId as keyof typeof achievementDefinitions];
    
    if (!definition) return { progress: 0, total: 1, percentage: 0 };

    let total = 0;
    switch (definition.requirement.type) {
      case 'wins':
      case 'losses':
      case 'win_streak':
        total = definition.requirement.count;
        break;
      case 'single_win':
      case 'bet_amount':
      case 'multiplier':
      case 'level':
        total = definition.requirement.amount;
        break;
    }

    return {
      progress: current.progress,
      total,
      percentage: Math.min((current.progress / total) * 100, 100)
    };
  }, [achievements]);

  return {
    achievements,
    checkAchievement,
    getUnlockedAchievements,
    getAchievementProgress
  };
}