import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from './CartContext';

const tabs = [
  { name: 'index', label: 'Home', icon: 'home-outline' },
  { name: 'rewards', label: 'Rewards', icon: 'cash-outline' },
  { name: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  { name: 'cart', label: 'Cart', icon: 'cart-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];

export default function CustomBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();

  const active = pathname === '/' ? 'index' : pathname.split('/').pop();


  return (
    <View style={styles.nav}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.push(tab.name === 'index' ? '/' : `/${tab.name}`)}
          style={styles.item}
        >
          <Ionicons
            name={tab.icon}
            size={22}
            color={active === tab.name ? '#2563eb' : '#534a4a'}
          />
          {tab.name === 'cart' && cart.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
          <Text style={[styles.label, active === tab.name && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 10,
    color: '#534a4a',
    marginTop: 4,
  },
  activeLabel: {
    color: '#2563eb',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
