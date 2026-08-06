import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '@/components/ThemeContext';

export function ThemeSystemSync() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export function getThemedStackScreenOptions(colors: { background: string }) {
  return {
    contentStyle: { backgroundColor: colors.background },
  };
}

export function getThemedLayoutStyle(colors: { background: string }) {
  return {
    flex: 1 as const,
    backgroundColor: colors.background,
  };
}
