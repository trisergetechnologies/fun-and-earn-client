import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import {
  DreamCashCoin,
  DreamCashCoinSizeKey,
  DREAM_CASH_COIN_SIZE,
} from '@/components/icons/DreamCashCoin';
import { spacing, typography } from '@/constants/DesignSystem';
import {
  formatDreamCashFigure,
  formatSignedDreamCashFigure,
} from '@/utils/walletFormat';

export { DreamCashCoin, DREAM_CASH_COIN_SIZE };
export type { DreamCashCoinProps, DreamCashCoinSizeKey } from '@/components/icons/DreamCashCoin';

type DreamCashAmountProps = {
  amount: number;
  signed?: boolean;
  isCredit?: boolean;
  /** Coin size preset or px. Defaults to `md`. */
  iconSize?: DreamCashCoinSizeKey | number;
  color?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Dream Cash figure with DC coin — no ₹.
 */
export function DreamCashAmount({
  amount,
  signed = false,
  isCredit = true,
  iconSize = 'md',
  color,
  iconColor,
  style,
  textStyle,
}: DreamCashAmountProps) {
  const label = signed
    ? formatSignedDreamCashFigure(amount, isCredit)
    : formatDreamCashFigure(amount);

  return (
    <View style={[styles.row, style]}>
      <DreamCashCoin size={iconSize} color={iconColor} />
      <Text style={[styles.amount, color ? { color } : null, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
  },
  amount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
