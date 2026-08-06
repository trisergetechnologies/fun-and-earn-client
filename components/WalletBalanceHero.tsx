import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { formatDreamCash } from '@/utils/walletFormat';

interface WalletBalanceHeroProps {
  balance: number;
  showHistoryLink?: boolean;
  onHistoryPress?: () => void;
  compact?: boolean;
  onPress?: () => void;
}

export function WalletBalanceHero({
  balance,
  showHistoryLink = false,
  onHistoryPress,
  compact = false,
  onPress,
}: WalletBalanceHeroProps) {
  const { colors } = useTheme();

  if (compact) {
    const content = (
      <View
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <View style={[styles.compactIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.compactText}>
          <Text style={[styles.compactLabel, { color: colors.textSecondary }]}>Dream Cash</Text>
          <Text style={[styles.compactAmount, { color: colors.text }]}>{formatDreamCash(balance)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          {content}
        </Pressable>
      );
    }
    return content;
  }

  const card = (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <View style={[styles.heroAccent, { backgroundColor: colors.primary }]} />
      <View style={styles.heroBody}>
        <View style={styles.heroTopRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: colors.primaryTint }]}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>AVAILABLE BALANCE</Text>
        </View>

        <Text style={[styles.heroAmount, { color: colors.text }]}>{formatDreamCash(balance)}</Text>
        <Text style={[styles.heroCaption, { color: colors.textMuted }]}>Dream Cash</Text>

        {showHistoryLink && onHistoryPress ? (
          <Pressable
            onPress={onHistoryPress}
            style={({ pressed }) => [
              styles.transactionsLink,
              { borderTopColor: colors.borderLight, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.transactionsText, { color: colors.primary }]}>
              View transaction history
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
        {card}
      </Pressable>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  heroAccent: {
    height: 3,
    width: '100%',
  },
  heroBody: {
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.2,
  },
  heroAmount: {
    fontSize: typography.fontSize.display + 8,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -1,
    marginBottom: spacing.xxs,
  },
  heroCaption: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xxs,
  },
  transactionsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  transactionsText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactText: {
    flex: 1,
  },
  compactLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 2,
  },
  compactAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
});
