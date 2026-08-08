import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeContext';

/** Preset diameters — pass a number for custom size. */
export const DREAM_CASH_COIN_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 36,
} as const;

export type DreamCashCoinSizeKey = keyof typeof DREAM_CASH_COIN_SIZE;

export type DreamCashCoinProps = {
  /** Preset key or pixel diameter. Default `md` (20). */
  size?: DreamCashCoinSizeKey | number;
  /** Fill color. Defaults to theme primary. */
  color?: string;
  /** Letter color. Defaults to white / primaryContrast. */
  textColor?: string;
  /** Outer rim color. Defaults to a lighter tint of fill. */
  rimColor?: string;
  style?: StyleProp<ViewStyle>;
};

function resolveSize(size: DreamCashCoinSizeKey | number): number {
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
    return Math.round(size);
  }
  if (typeof size === 'string' && size in DREAM_CASH_COIN_SIZE) {
    return DREAM_CASH_COIN_SIZE[size];
  }
  return DREAM_CASH_COIN_SIZE.md;
}

/**
 * Global DreamMart Coin mark — circle with "DMC".
 * Use beside coin amounts (not for real INR / ₹).
 */
export function DreamCashCoin({
  size = 'md',
  color,
  textColor,
  rimColor,
  style,
}: DreamCashCoinProps) {
  const { colors } = useTheme();
  const diameter = resolveSize(size);
  const fill = color ?? colors.primary;
  const ink = textColor ?? colors.primaryContrast;
  const rim = rimColor ?? colors.primaryMuted;
  const fontSize = Math.max(6, Math.round(diameter * 0.28));
  const rimWidth = Math.max(1, Math.round(diameter * 0.08));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="DreamMart Coin"
      style={[
        styles.coin,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: fill,
          borderColor: rim,
          borderWidth: rimWidth,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: ink,
            fontSize,
            lineHeight: fontSize + 1,
            letterSpacing: diameter < 18 ? -0.4 : -0.6,
          },
        ]}
      >
        DMC
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
