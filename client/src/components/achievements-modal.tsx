import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { achievementDefinitions } from '@shared/schema';
import { useAchievements } from '@/hooks/use-achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements, getAchievementProgress } = useAchievements();

  const allAchievements = Object.values(achievementDefinitions);
  const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-game-darker border-game-purple/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-trophy text-game-cyan"></i>
            Achievements ({unlockedCount}/{allAchievements.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {allAchievements.map((achievement) => {
            const current = achievements[achievement.id] || { unlocked: false, progress: 0 };
            const progress = getAchievementProgress(achievement.id);
            
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  current.unlocked 
                    ? 'bg-game-green/10 border-game-green/30' 
                    : 'bg-game-dark/50 border-game-purple/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h3 className={`font-semibold ${current.unlocked ? 'text-game-green' : 'text-white'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                      
                      {achievement.reward && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Reward: {achievement.reward.type === 'credits' 
                              ? `${achievement.reward.amount} credits`
                              : `${achievement.reward.item} ${achievement.reward.type}`
                            }
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {current.unlocked ? (
                    <Badge className="bg-game-green text-white">
                      <i className="fas fa-check mr-1"></i>
                      Unlocked
                    </Badge>
                  ) : (
                    <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">
                        {progress.progress} / {progress.total}
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className="w-20 h-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}