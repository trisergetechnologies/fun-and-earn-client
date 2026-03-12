import { getToken } from '@/helpers/authStorage';
import { Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DreamPointsInfo from '@/components/DreamPointMessage';
import { useTheme } from '@/components/ThemeContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const WalletScreen = () => {
  const { colors } = useTheme();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const toastAnim = useState(new Animated.Value(-100))[0]; // off-screen at start

  const [withdrawAmount, setWithdrawAmount] = useState<string>(''); // using string for TextInput

  const router = useRouter();

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);

    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMessage(null);
      });
    }, 3000);
  };


  const handleRedeem = async () => {
    if (!couponCode.trim()) {
      showMessage("Enter a valid coupon code", 'error');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const redeemUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/redeemcoupon`;

      const res = await axios.post(
        redeemUrl,
        { code: couponCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        showMessage(res?.data?.message || "Coupon redeemed successfully", 'success');
        setCouponCode('');
        fetchWallet();
      } else {
        showMessage(res?.data?.message || "Coupon redemption failed", 'error');
      }

    } catch (err: any) {
      showMessage(err?.response?.data?.message || "Invalid coupon", 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    const token = await getToken();
    const getWalletUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`;
    try {
      const response = await axios.get(getWalletUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setWalletBalance(response.data.data.eCartWallet);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  }

  useEffect(() => {
    fetchWallet();
  }, [])

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      showMessage("Enter a valid amount to withdraw.", 'error');
      return;
    }

    if (amount > walletBalance) {
      showMessage("Withdrawal amount exceeds available balance.", 'error');
      return;
    }

    try {
      setLoading(true);
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
        showMessage(response.data.message || 'Withdrawal request submitted.', 'success');
        setWithdrawAmount('');
        fetchWallet();
      } else {
        showMessage(response.data.message || 'Withdrawal failed.', 'error');
      }
    } catch (error: any) {
      console.error('Withdraw Error:', error.response?.data || error.message);
      showMessage(error.response?.data?.message || 'Failed to withdraw.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {message && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor: messageType === 'success' ? colors.success : colors.error,
            },
          ]}
        >
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>Your Wallet</Text>

      <View style={[styles.balanceCard, { backgroundColor: colors.successMuted }]}>
        <Ionicons name="wallet" size={28} color={colors.success} />
        <View style={styles.balanceTextGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Dream Cash</Text>
          <Text style={[styles.amount, { color: colors.success }]}>{walletBalance.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actionCard}>
        <TouchableOpacity
          onPress={() => router.push('/private/transactions')}
          style={[styles.pillButtonSecondary, { backgroundColor: colors.primaryTint }]}
        >
          <Ionicons name="list-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.buttonTextBlue, { color: colors.primary }]}>Wallet Summary</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.withdrawCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={[styles.withdrawTitle, { color: colors.text }]}>Withdraw Amount</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter amount to withdraw"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.withdrawButton, { backgroundColor: colors.primary }]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          <Text style={styles.withdrawButtonText}>
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.redeemCard, { backgroundColor: colors.successMuted, borderColor: colors.borderLight }]}>
        <Text style={[styles.redeemTitle, { color: colors.text }]}>Have a Coupon Code?</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="pricetag-outline" size={20} color={colors.success} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter coupon code"
            placeholderTextColor={colors.textMuted}
            value={couponCode}
            onChangeText={setCouponCode}
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.redeemButton, { backgroundColor: colors.success }]}
          onPress={handleRedeem}
          disabled={loading}
        >
          <Text style={styles.redeemButtonText}>
            {loading ? 'Redeeming...' : 'Redeem Coupon'}
          </Text>
        </TouchableOpacity>
      </View>

      <DreamPointsInfo />
    </ScrollView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 30,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  balanceTextGroup: {
    marginLeft: 16,
  },
  label: {
    fontSize: 14,
  },
  amount: {
    fontSize: 26,
    fontWeight: '700',
  },

  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  redeemCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  pillButtonSecondary: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Primary button text
  buttonTextWhite: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // Blue button text
  buttonTextBlue: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 15,
  },

  // Disabled button and text
  buttonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  buttonTextDisabled: {
    color: '#aaa',
  },

  // Old single-action buttons (still used for fallback or other screens)
  actionButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 22,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },

  redeemContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
  },
  redeemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  messageText: {
    color: '#92400e',
    marginTop: 8,
    fontSize: 13,
  },
  redeemButton: {
    marginTop: 16,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  withdrawCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    marginBottom: 10,
  },
  withdrawTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  withdrawButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  withdrawButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  toast: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

});

