import { Card } from '@/components/ui';
import { DreamCashAmount } from '@/components/DreamCashAmount';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { formatDreamCash } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

interface CheckoutWalletToggleProps {
  balance: number;
  useWallet: boolean;
  toggling: boolean;
  onToggle: () => void;
  estimatedTotal: number;
}

export function CheckoutWalletToggle({
  balance,
  useWallet,
  toggling,
  onToggle,
  estimatedTotal,
}: CheckoutWalletToggleProps) {
  const { colors } = useTheme();
  const walletApplied = useWallet ? Math.min(balance, estimatedTotal) : 0;
  const payable = Math.max(0, estimatedTotal - walletApplied);

  return (
    <Card padding={spacing.md}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.label, { color: colors.text }]}>Use DreamMart Coin</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balance, { color: colors.textSecondary }]}>Available </Text>
            <DreamCashAmount
              amount={balance}
              iconSize="sm"
              color={colors.textSecondary}
              textStyle={styles.balance}
            />
          </View>
        </View>
        {toggling ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Switch
            trackColor={{ false: colors.border, true: colors.primary + '66' }}
            thumbColor={useWallet ? colors.primary : colors.card}
            ios_backgroundColor={colors.border}
            onValueChange={onToggle}
            value={useWallet}
          />
        )}
      </View>

      {useWallet ? (
        <View style={[styles.hintBox, { backgroundColor: colors.primaryTint }]}>
          {walletApplied > 0 ? (
            <View style={styles.hintAppliedRow}>
              <DreamCashAmount
                amount={walletApplied}
                iconSize="sm"
                color={colors.primary}
                textStyle={styles.hintText}
              />
              <Text style={[styles.hintText, { color: colors.primary }]}>
                {' '}
                will be applied from your wallet.
              </Text>
            </View>
          ) : (
            <Text style={[styles.hintText, { color: colors.primary }]}>
              Wallet balance will be applied at checkout.
            </Text>
          )}
          <Text style={[styles.hintSubtext, { color: colors.textSecondary }]}>
            {payable <= 0
              ? 'Remaining payable: ₹0.00 — wallet only order'
              : `Remaining payable: ${formatDreamCash(payable)}`}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  balance: {
    fontSize: typography.fontSize.sm,
  },
  hintBox: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hintAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 19,
  },
  hintSubtext: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xxs,
    lineHeight: 19,
  },
});
