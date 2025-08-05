import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  getCurrentTheme: (systemTheme?: 'light' | 'dark') => 'light' | 'dark';
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },
      
      getCurrentTheme: (systemTheme = 'light') => {
        const { themeMode } = get();
        
        switch (themeMode) {
          case 'light':
            return 'light';
          case 'dark':
            return 'dark';
          case 'system':
          default:
            return systemTheme;
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;
