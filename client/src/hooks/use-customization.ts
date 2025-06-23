import { useLocalStorage } from './use-local-storage';
import { skinDefinitions, themeDefinitions } from '@shared/schema';

interface CustomizationData {
  selectedSkin: string;
  selectedTheme: string;
  unlockedSkins: string[];
  unlockedThemes: string[];
}

const initialCustomization: CustomizationData = {
  selectedSkin: 'ufo',
  selectedTheme: 'neon',
  unlockedSkins: ['ufo'],
  unlockedThemes: ['neon']
};

export function useCustomization() {
  const [customization, setCustomization] = useLocalStorage<CustomizationData>('customization', initialCustomization);

  const selectSkin = (skinId: string) => {
    if (customization.unlockedSkins.includes(skinId)) {
      setCustomization(prev => ({ ...prev, selectedSkin: skinId }));
    }
  };

  const selectTheme = (themeId: string) => {
    if (customization.unlockedThemes.includes(themeId)) {
      setCustomization(prev => ({ ...prev, selectedTheme: themeId }));
    }
  };

  const unlockSkin = (skinId: string) => {
    setCustomization(prev => ({
      ...prev,
      unlockedSkins: [...new Set([...prev.unlockedSkins, skinId])]
    }));
  };

  const unlockTheme = (themeId: string) => {
    setCustomization(prev => ({
      ...prev,
      unlockedThemes: [...new Set([...prev.unlockedThemes, themeId])]
    }));
  };

  const getCurrentSkin = () => {
    return skinDefinitions[customization.selectedSkin as keyof typeof skinDefinitions] || skinDefinitions.ufo;
  };

  const getCurrentTheme = () => {
    return themeDefinitions[customization.selectedTheme as keyof typeof themeDefinitions] || themeDefinitions.neon;
  };

  const getAvailableSkins = (userLevel: number) => {
    return Object.values(skinDefinitions).filter(skin => skin.unlockLevel <= userLevel);
  };

  return {
    customization,
    selectSkin,
    selectTheme,
    unlockSkin,
    unlockTheme,
    getCurrentSkin,
    getCurrentTheme,
    getAvailableSkins
  };
}