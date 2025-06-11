import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WalletScreen = () => {
  const walletBalance = 1250.50;
  const earningBalance = 750.25;
  const shoppingBalance = 500.25;

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

      <View style={styles.sectionTitleBox}>
        <Text style={styles.sectionTitle}>Wallet Breakdown</Text>
      </View>

      <View style={styles.walletCardGroup}>
        <View style={styles.walletCard}>
          <FontAwesome5 name="coins" size={24} color="#f59e0b" />
          <Text style={styles.walletLabel}>Earnings Wallet</Text>
          <Text style={styles.walletValue}>₹{earningBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.walletCard}>
          <FontAwesome5 name="shopping-cart" size={24} color="#3b82f6" />
          <Text style={styles.walletLabel}>Shopping Wallet</Text>
          <Text style={styles.walletValue}>₹{shoppingBalance.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.buttonText}>Withdraw Funds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}>
        <Text style={styles.buttonText}>Transaction History</Text>
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
});
