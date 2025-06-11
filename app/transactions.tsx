import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const walletBalance = 1350;

const transactions = [
  {
    id: '1',
    title: 'Cashback from Order #1234',
    amount: 50,
    type: 'credit',
    date: 'May 26, 2025',
  },
  {
    id: '2',
    title: 'Used for Order #1235',
    amount: -100,
    type: 'debit',
    date: 'May 24, 2025',
  },
  {
    id: '3',
    title: 'Referral Bonus',
    amount: 100,
    type: 'credit',
    date: 'May 21, 2025',
  },
  {
    id: '4',
    title: 'Refund from Order #1232',
    amount: 200,
    type: 'credit',
    date: 'May 18, 2025',
  },
];

export default function TransactionScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <Ionicons
        name={item.type === 'credit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
        size={28}
        color={item.type === 'credit' ? '#10b981' : '#ef4444'}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.txnTitle}>{item.title}</Text>
        <Text style={styles.txnDate}>{item.date}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: item.type === 'credit' ? '#10b981' : '#ef4444' }]}>
        {item.type === 'credit' ? '+' : '-'}₹{Math.abs(item.amount)}
      </Text>
    </View>
  );

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
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
    marginTop: 28,
  },
  walletCard: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletText: {
    fontSize: 14,
    color: '#555',
  },
  walletAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3b82f6',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  txnTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  txnDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
