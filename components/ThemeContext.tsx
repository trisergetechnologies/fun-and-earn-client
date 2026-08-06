import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemePreference, darkTheme, lightTheme } from '@/constants/Theme';

const THEME_STORAGE_KEY = 'app_theme_preference';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  isThemeReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreferenceState(stored);
        }
      })
      .finally(() => setIsThemeReady(true));
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, preference).catch(() => {});
  }, []);

  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const colors = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      isDark,
      themePreference,
      setThemePreference,
      isThemeReady,
    }),
    [colors, isDark, themePreference, setThemePreference, isThemeReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
