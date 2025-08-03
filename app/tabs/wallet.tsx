import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DreamPointsInfo from '@/components/DreamPointMessage';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const WalletScreen = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };


  const handleRedeem = async () => {
    if (!couponCode.trim()) {
      showMessage("Enter a valid coupon code");
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

      showMessage(res?.data?.message || "Coupon redeemed successfully");
      setCouponCode('');
      fetchWallet(); // refresh balance
    } catch (err: any) {
      showMessage(err?.response?.data?.message || "Invalid coupon");
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
  })

  const handleWithdraw = async () => {
    // if (walletBalance <= 0) return;

    try {
      const token = await getToken();
      const withdrawUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/withdraw`;

      const response = await axios.put(
        withdrawUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('Withdrawal request successful!');
        fetchWallet();
      } else {
        alert(response.data.message || 'Withdrawal failed.');
      }
    } catch (error: any) {
      console.error('Withdraw Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to withdraw.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Your Wallet</Text>

      <View style={styles.balanceCard}>
        {/* <Ionicons name="wallet-outline" size={32} color="#10b981" /> */}
        <Ionicons name="ribbon" size={24} color="#10b981" />
        <View style={styles.balanceTextGroup}>
          <Text style={styles.label}>Total Dream Cash</Text>
          <Text style={styles.amount}>{walletBalance.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actionCard}>
        <TouchableOpacity
          onPress={handleWithdraw}
          style={[
            styles.pillButton,
            walletBalance <= 0 && styles.buttonDisabled
          ]}
          disabled={walletBalance <= 0}
        >
          <Ionicons name="cash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text
            style={[
              styles.buttonTextWhite,
              walletBalance <= 0 && styles.buttonTextDisabled
            ]}
          >
            Withdraw
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/private/transactions')}
          style={[styles.pillButtonSecondary]}
        >
          <Ionicons name="list-outline" size={18} color="#3b82f6" style={{ marginRight: 6 }} />
          <Text style={styles.buttonTextBlue}>Wallet Summary</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.redeemCard}>
        <Text style={styles.redeemTitle}>Have a Coupon Code?</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="ticket-outline" size={20} color="#10b981" />
          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            placeholderTextColor="#999"
            value={couponCode}
            onChangeText={setCouponCode}
            editable={!loading}
          />
        </View>

        {message && <Text style={styles.messageText}>{message}</Text>}

        <TouchableOpacity
          style={[styles.redeemButton]}
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
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
    marginTop: 30,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6fff2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  balanceTextGroup: {
    marginLeft: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },

  // NEW: Grouped action buttons
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },

  // Premium pill-style primary button
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#047857',
    paddingVertical: 12,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  redeemCard: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },

  // Pill secondary (blue accent) button
  pillButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e0ecff',
    paddingVertical: 12,
    borderRadius: 100,
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

  // Withdraw (legacy-style, still applies when not using grouped buttons)
  withdrawButton: {
    backgroundColor: '#047857',
    paddingVertical: 10,
    borderRadius: 50,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#047857',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
    elevation: 0,
  },
  withdrawButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  withdrawButtonTextDisabled: {
    color: '#888',
  },

  // Redeem section styles
  redeemContainer: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  redeemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111',
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
});

