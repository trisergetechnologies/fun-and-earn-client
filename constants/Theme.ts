/**
 * App theme tokens – work in both light and dark mode.
 * Keeps existing primary (#572fff family) with enhancements.
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Surfaces
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  // Brand & accents
  primary: string;
  primaryMuted: string;
  primaryTint: string;
  primaryContrast: string;
  // Semantic
  success: string;
  successMuted: string;
  error: string;
  errorMuted: string;
  warning: string;
  // Borders & dividers
  border: string;
  borderLight: string;
  // Overlays
  overlay: string;
  // Discount / badge
  discount: string;
  discountText: string;
}

export const lightTheme: ThemeColors = {
  background: '#F5F5F7',
  backgroundSecondary: '#EBEBED',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#1D1D1F',
  textSecondary: '#424245',
  textMuted: '#6E6E73',
  textInverse: '#FFFFFF',
  primary: '#572FFF',
  primaryMuted: '#7C5CFF',
  primaryTint: '#EDE9FE',
  primaryContrast: '#FFFFFF',
  success: '#16A34A',
  successMuted: '#DCFCE7',
  error: '#DC2626',
  errorMuted: '#FEE2E2',
  warning: '#F59E0B',
  border: '#E5E5E7',
  borderLight: '#F0F0F2',
  overlay: 'rgba(0,0,0,0.45)',
  discount: '#16A34A',
  discountText: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  background: '#0D0D0F',
  backgroundSecondary: '#1C1C1E',
  card: '#1C1C1E',
  cardElevated: '#2C2C2E',
  text: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textMuted: '#6E6E73',
  textInverse: '#1D1D1F',
  primary: '#7C5CFF',
  primaryMuted: '#9D85FF',
  primaryTint: '#2D2A3E',
  primaryContrast: '#FFFFFF',
  success: '#22C55E',
  successMuted: '#14532D',
  error: '#EF4444',
  errorMuted: '#450A0A',
  warning: '#FBBF24',
  border: '#38383A',
  borderLight: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.7)',
  discount: '#22C55E',
  discountText: '#FFFFFF',
};
