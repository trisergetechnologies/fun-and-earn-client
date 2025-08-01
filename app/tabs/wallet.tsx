import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const WalletScreen = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const router = useRouter();

  const fetchWallet= async ()=>{
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

  useEffect(()=>{
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
        <Ionicons name="wallet-outline" size={32} color="#10b981" />
        <View style={styles.balanceTextGroup}>
          <Text style={styles.label}>Total Balance</Text>
          <Text style={styles.amount}>₹{walletBalance.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleWithdraw}
        style={[
          styles.withdrawButton,
          walletBalance <= 0 && styles.withdrawButtonDisabled
        ]}
        // disabled={walletBalance <= 0}
      >
        <Text
          style={[
            styles.withdrawButtonText,
            walletBalance <= 0 && styles.withdrawButtonTextDisabled
          ]}
        >
          Withdraw
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=> router.push('/private/transactions')} style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}>
        <Text style={styles.buttonText}>Wallet Summary</Text>
      </TouchableOpacity>
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
  sectionTitleBox: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  walletCardGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  walletCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  walletLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#333',
  },
  walletValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
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
  withdrawButton: {
  backgroundColor: '#047857', // strong emerald green
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
}
});
