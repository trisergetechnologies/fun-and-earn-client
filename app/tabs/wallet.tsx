import { getToken } from '@/helpers/authStorage';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { DREAM_MART_POINTS_LABEL } from '@/constants/walletLabels';
import { AdMobBannerSlot } from '@/components/AdMobBannerSlot';
import DreamPointsInfo from '@/components/DreamPointMessage';
import { Screen } from '@/components/Screen';
import { WalletBalanceHero } from '@/components/WalletBalanceHero';
import { useTheme } from '@/components/ThemeContext';
import { spacing, typography } from '@/constants/DesignSystem';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const WalletScreen = () => {
  const { colors } = useTheme();

  const [walletBalance, setWalletBalance] = useState(0);
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
            Manage your {DREAM_MART_POINTS_LABEL} balance
          </Text>

          <WalletBalanceHero balance={walletBalance} />

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
});
