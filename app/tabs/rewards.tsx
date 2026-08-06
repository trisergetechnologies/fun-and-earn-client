import { getToken } from '@/helpers/authStorage';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Coupon } from '@/types/coupon';
import {
  canCopyCoupon,
  formatCouponExpiry,
  getAvailableCouponsSummary,
  getCouponStatus,
  getCouponStatusColors,
  getCouponStatusLabel,
} from '@/utils/couponLabels';
import { formatDreamCashFigure } from '@/utils/walletFormat';
import { DreamCashAmount, DreamCashCoin } from '@/components/DreamCashAmount';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

function RewardsInfoFooter() {
  const { colors } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.infoContainer,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.infoHeader, { opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={styles.infoHeaderLeft}>
          <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          </View>
          <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>How to use coupons</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded ? (
        <View style={[styles.infoBodyWrap, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.infoBody, { color: colors.textMuted }]}>
            Copy a coupon code here, then redeem it in your Wallet under Redeem coupon to add Dream
            Cash to your balance.
          </Text>
          <Button
            title="Go to wallet"
            onPress={() => router.push('/tabs/wallet')}
            variant="outline"
            size="sm"
            style={styles.infoButton}
          />
        </View>
      ) : null}
    </View>
  );
}

function CouponCard({
  coupon,
  copiedCode,
  onCopy,
}: {
  coupon: Coupon;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}) {
  const { colors } = useTheme();
  const status = getCouponStatus(coupon);
  const { bg, text } = getCouponStatusColors(status, colors);
  const copyEnabled = canCopyCoupon(coupon);
  const expiry = formatCouponExpiry(coupon.expiresAt);
  const isCopied = copiedCode === coupon.code;

  return (
    <Card padding={spacing.md} style={styles.couponCard}>
      <View style={styles.cardTopRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="gift-outline" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text numberOfLines={2} style={[styles.couponTitle, { color: colors.text }]}>
            {coupon.title || 'Reward coupon'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <Text style={[styles.statusBadgeText, { color: text }]}>{getCouponStatusLabel(status)}</Text>
        </View>
      </View>

      {coupon.description ? (
        <Text numberOfLines={3} style={[styles.couponDesc, { color: colors.textSecondary }]}>
          {coupon.description}
        </Text>
      ) : null}

      <View
        style={[
          styles.codeRow,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight },
        ]}
      >
        <Text style={[styles.codeText, { color: colors.text }]}>{coupon.code}</Text>
        {copyEnabled ? (
          <Pressable
            onPress={() => onCopy(coupon.code)}
            accessibilityLabel="Copy coupon code"
            style={({ pressed }) => [
              styles.copyBtn,
              { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name={isCopied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={isCopied ? colors.success : colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <DreamCashAmount
            amount={coupon.value}
            iconSize="sm"
            color={colors.textSecondary}
            textStyle={styles.metaText}
          />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}> off</Text>
        </View>
        {expiry ? (
          <Text style={[styles.metaText, { color: colors.textMuted }]}>Expires {expiry}</Text>
        ) : null}
      </View>

      {copyEnabled ? (
        <Button
          title={isCopied ? 'Copied' : 'Copy code'}
          onPress={() => onCopy(coupon.code)}
          variant="secondary"
          size="sm"
          fullWidth
          leftIcon={<Ionicons name="copy-outline" size={16} />}
          style={styles.copyButton}
        />
      ) : null}
    </Card>
  );
}

const RewardScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    const token = await getToken();
    const response = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/general/getrewards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.success) {
      setCoupons(response.data.data ?? []);
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      await fetchCoupons();
    } catch (error: unknown) {
      console.error(
        'Failed to fetch coupons:',
        axios.isAxiosError(error) ? error.response?.data : error
      );
      Toast.show({ type: 'error', text1: 'Could not load rewards', text2: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  useFocusEffect(
    useCallback(() => {
      loadCoupons();
    }, [loadCoupons])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCoupons();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not refresh rewards' });
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopiedCode(code);
      Toast.show({ type: 'success', text1: 'Copied', text2: 'Coupon code copied to clipboard' });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const summary = getAvailableCouponsSummary(coupons);

  const ListHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Rewards</Text>
      <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
        Coupons you can redeem in your wallet
      </Text>

      {coupons.length > 0 ? (
        <View style={[styles.summaryStrip, { backgroundColor: colors.primaryTint }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: colors.primary }]}>
              {summary.count} available ·{' '}
            </Text>
            <DreamCashCoin size="sm" />
            <Text style={[styles.summaryText, { color: colors.primary }]}>
              {' '}
              {formatDreamCashFigure(summary.totalValue)} total value
            </Text>
          </View>
        </View>
      ) : null}

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>AVAILABLE COUPONS</Text>
    </View>
  );

  const ListFooter = () => (
    <View style={styles.footer}>
      <RewardsInfoFooter />
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={coupons}
        keyExtractor={(item) => item._id || item.code}
        renderItem={({ item }) => (
          <CouponCard coupon={item} copiedCode={copiedCode} onCopy={copyToClipboard} />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <EmptyState
            icon="gift-outline"
            title="No coupons yet"
            subtitle="Your reward coupons will appear here when you earn them."
            style={styles.emptyState}
            action={
              <Button
                title="Browse products"
                onPress={() => router.push('/tabs/explore')}
                variant="primary"
                size="md"
              />
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </Screen>
  );
};

export default RewardScreen;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  summaryStrip: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  couponCard: {
    marginBottom: spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: {
    flex: 1,
  },
  couponTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  couponDesc: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  codeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
    flex: 1,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
  },
  copyButton: {
    marginTop: spacing.xxs,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
  footer: {
    marginTop: spacing.md,
  },
  infoContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  infoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  infoBodyWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  infoBody: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  infoButton: {
    alignSelf: 'flex-start',
  },
});
