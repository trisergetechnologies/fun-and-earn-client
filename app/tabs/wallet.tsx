import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { AdMobBannerSlot } from '@/components/AdMobBannerSlot';
import DreamPointsInfo from '@/components/DreamPointMessage';
import { DreamCashCoin } from '@/components/icons/DreamCashCoin';
import { Screen } from '@/components/Screen';
import { WalletBalanceHero } from '@/components/WalletBalanceHero';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const WalletScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [walletBalance, setWalletBalance] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (type: 'success' | 'error', text1: string, text2?: string) => {
    Toast.show({ type, text1, text2, position: 'top' });
  };

  const fetchWallet = useCallback(async () => {
    const token = await getToken();
    const getWalletUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`;
    try {
      const response = await axios.get(getWalletUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setWalletBalance(response.data.data.eCartWallet);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchWallet();
    } catch {
      showToast('error', 'Could not refresh balance');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRedeem = async () => {
    if (!couponCode.trim()) {
      showToast('error', 'Invalid coupon', 'Enter a valid coupon code.');
      return;
    }

    try {
      setRedeeming(true);
      const token = await getToken();
      const redeemUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/redeemcoupon`;

      const res = await axios.post(
        redeemUrl,
        { code: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast('success', 'Coupon redeemed', res?.data?.message || 'Added to your wallet.');
        setCouponCode('');
        await fetchWallet();
      } else {
        showToast('error', 'Redemption failed', res?.data?.message || 'Please try again.');
      }
    } catch (err: any) {
      showToast('error', 'Invalid coupon', err?.response?.data?.message || 'Please check the code.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      showToast('error', 'Invalid amount', 'Enter a valid amount to withdraw.');
      return;
    }

    if (amount > walletBalance) {
      showToast('error', 'Insufficient balance', 'Withdrawal amount exceeds available balance.');
      return;
    }

    try {
      setWithdrawing(true);
      const token = await getToken();
      const withdrawUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/requestwithdrawal`;

      const response = await axios.post(
        withdrawUrl,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        showToast('success', 'Request submitted', response.data.message || 'Withdrawal is being processed.');
        setWithdrawAmount('');
        await fetchWallet();
      } else {
        showToast('error', 'Withdrawal failed', response.data.message || 'Please try again.');
      }
    } catch (error: any) {
      console.error('Withdraw Error:', error.response?.data || error.message);
      showToast('error', 'Withdrawal failed', error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleMaxWithdraw = () => {
    if (walletBalance > 0) {
      setWithdrawAmount(walletBalance.toFixed(2));
    }
  };

  return (
    <Screen>
      <View style={styles.column}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <Text style={[styles.pageTitle, { color: colors.text }]}>Wallet</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            Manage your Dream Cash balance
          </Text>

          <WalletBalanceHero
            balance={walletBalance}
            showHistoryLink
            onHistoryPress={() => router.push('/private/transactions')}
          />

          {/* Withdraw */}
          <Card padding="lg" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="arrow-up-circle-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Withdraw</Text>
                <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
                  Transfer to your linked bank account
                </Text>
              </View>
            </View>

            <View style={[styles.amountRow, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
              <DreamCashCoin size="md" style={styles.currencyPrefix} />
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                editable={!withdrawing && !redeeming}
              />
              <Pressable
                onPress={handleMaxWithdraw}
                disabled={walletBalance <= 0 || withdrawing || redeeming}
                style={({ pressed }) => [
                  styles.maxChip,
                  {
                    backgroundColor: colors.primaryTint,
                    opacity: walletBalance <= 0 || withdrawing || redeeming ? 0.4 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.maxChipText, { color: colors.primary }]}>MAX</Text>
              </Pressable>
            </View>

            <Button
              title={withdrawing ? 'Processing…' : 'Request withdrawal'}
              onPress={handleWithdraw}
              loading={withdrawing}
              disabled={redeeming}
              fullWidth
              size="lg"
              leftIcon={<Ionicons name="send-outline" size={18} />}
            />
          </Card>

          {/* Redeem coupon */}
          <Card padding="lg" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Redeem coupon</Text>
                <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
                  Apply a reward code to add balance
                </Text>
              </View>
            </View>

            <View style={[styles.couponRow, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="ticket-outline" size={18} color={colors.textMuted} style={styles.couponIcon} />
              <TextInput
                style={[styles.couponInput, { color: colors.text }]}
                placeholder="Enter coupon code"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                value={couponCode}
                onChangeText={setCouponCode}
                editable={!withdrawing && !redeeming}
              />
            </View>

            <Button
              title={redeeming ? 'Redeeming…' : 'Redeem coupon'}
              onPress={handleRedeem}
              variant="outline"
              loading={redeeming}
              disabled={withdrawing}
              fullWidth
              size="lg"
            />
          </Card>

          <DreamPointsInfo />
        </ScrollView>
        <AdMobBannerSlot />
      </View>
    </Screen>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    paddingTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  currencyPrefix: {
    marginRight: spacing.xxs,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    paddingVertical: spacing.md,
  },
  maxChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.sm,
  },
  maxChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  couponIcon: {
    marginRight: spacing.sm,
  },
  couponInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
    letterSpacing: 1,
  },
});
