import { useAuth } from '@/components/AuthContext';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';


interface Transaction {
  _id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer' | 'withdraw';
  source: 'watchTime' | 'purchase' | 'manual' | 'admin';
  fromWallet: 'shortVideoWallet' | 'eCartWallet' | 'reward';
  toWallet: 'shortVideoWallet' | 'eCartWallet' | 'rewardWallet' | null;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  triggeredBy: 'user' | 'system' | 'admin';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
import axios from 'axios';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

export default function TransactionScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);


    const fetchTransactions= async ()=>{
    const token = await getToken();
    const getWalletUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallettransactions`;
    try {
      const response = await axios.get(getWalletUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  }
  
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

    const renderItem = ({ item }: { item: Transaction }) => {
    const isEarn = item.type === 'earn';
    const icon =
      item.type === 'earn'
        ? 'arrow-down-circle-outline'
        : item.type === 'spend'
        ? 'arrow-up-circle-outline'
        : 'swap-horizontal-outline';

    const iconColor =
      item.status === 'failed'
        ? 'red'
        : item.status === 'pending'
        ? 'orange'
        : isEarn
        ? 'green'
        : '#3b82f6';

    return (
      <View style={styles.transactionCard}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.transactionText}>
            {item.type.toUpperCase()} - ₹{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.metaText}>
            From: {item.fromWallet} {item.toWallet ? `→ ${item.toWallet}` : ''}
          </Text>
          <Text style={styles.metaText}>
            Source: {item.source} • {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.notes && <Text style={styles.noteText}>Note: {item.notes}</Text>}
        </View>
        <Text style={[styles.statusText, { color: iconColor }]}>
          {item.status}
        </Text>
      </View>
    );
  };
  
      useEffect(() => {
          if (isAuthenticated === false) {
            router.replace('/signin');
          }
          fetchTransactions();
          fetchWallet();

      }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>💰 Wallet Summary</Text>

      <View style={styles.walletCard}>
        <Ionicons name="wallet-outline" size={28} color="#3b82f6" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.walletText}>Current Balance</Text>
          <Text style={styles.walletAmount}>₹{walletBalance}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Transaction History</Text>

      <FlatList
        data={transactions || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 28 },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f1f5ff',
    marginVertical: 12,
  },
  walletText: { color: '#555', fontSize: 14 },
  walletAmount: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6' },
  sectionHeader: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },
  transactionText: { fontSize: 15, fontWeight: '600', color: '#222' },
  metaText: { fontSize: 12, color: '#777', marginTop: 2 },
  noteText: { fontSize: 12, fontStyle: 'italic', color: '#444', marginTop: 4 },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },
});


// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     flex: 1,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 16,
//     color: '#111',
//     marginTop: 28,
//   },
//   walletCard: {
//     backgroundColor: '#e0f2fe',
//     padding: 16,
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   walletText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   walletAmount: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#3b82f6',
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: '#333',
//   },
//   transactionCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#eee',
//     flexDirection: 'row',
//     alignItems: 'center',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   txnTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#111',
//   },
//   txnDate: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 2,
//   },
//   txnAmount: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
