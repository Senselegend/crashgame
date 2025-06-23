import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { skinDefinitions, themeDefinitions } from '@shared/schema';
import { useCustomization } from '@/hooks/use-customization';
import { UserData } from '@shared/schema';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

export function CustomizationModal({ isOpen, onClose, userData }: CustomizationModalProps) {
  const { 
    customization, 
    selectSkin, 
    selectTheme, 
    getCurrentSkin, 
    getCurrentTheme,
    getAvailableSkins 
  } = useCustomization();

  const availableSkins = getAvailableSkins(userData.level);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-game-darker border-game-purple/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-palette text-game-purple"></i>
            Customization
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="skins" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-game-dark">
            <TabsTrigger value="skins" className="data-[state=active]:bg-game-purple">
              Spaceship Skins
            </TabsTrigger>
            <TabsTrigger value="themes" className="data-[state=active]:bg-game-purple">
              Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skins" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(skinDefinitions).map((skin) => {
                const isUnlocked = customization.unlockedSkins.includes(skin.id);
                const isSelected = customization.selectedSkin === skin.id;
                const isAvailable = availableSkins.some(s => s.id === skin.id);
                
                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      isSelected 
                        ? 'border-game-purple bg-game-purple/20' 
                        : isUnlocked
                          ? 'border-game-blue/30 bg-game-dark/50 hover:border-game-blue'
                          : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{skin.emoji}</div>
                    <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      {skin.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Level {skin.unlockLevel}
                    </p>
                    
                    {isSelected ? (
                      <Button disabled className="w-full bg-game-purple">
                        <i className="fas fa-check mr-2"></i>
                        Selected
                      </Button>
                    ) : isUnlocked ? (
                      <Button 
                        onClick={() => selectSkin(skin.id)}
                        className="w-full bg-game-blue hover:bg-game-blue/80"
                      >
                        Select
                      </Button>
                    ) : isAvailable ? (
                      <Button disabled className="w-full">
                        Complete Achievement
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        Locked
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(themeDefinitions).map((theme) => {
                const isUnlocked = customization.unlockedThemes.includes(theme.id);
                const isSelected = customization.selectedTheme === theme.id;
                
                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-game-purple bg-game-purple/20' 
                        : isUnlocked
                          ? 'border-game-blue/30 bg-game-dark/50 hover:border-game-blue'
                          : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary }}
                      ></div>
                      <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {theme.name}
                      </h3>
                    </div>
                    
                    {isSelected ? (
                      <Button disabled className="w-full bg-game-purple">
                        <i className="fas fa-check mr-2"></i>
                        Selected
                      </Button>
                    ) : isUnlocked ? (
                      <Button 
                        onClick={() => selectTheme(theme.id)}
                        className="w-full bg-game-blue hover:bg-game-blue/80"
                      >
                        Select
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        Locked
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}