import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';
import { useEffect } from 'react';

const tabs = [
  { name: 'explore', label: 'Home', icon: 'home-outline' },
  { name: 'rewards', label: 'Rewards', icon: 'cash-outline' },
  { name: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  { name: 'cart', label: 'Cart', icon: 'cart-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];

export default function CustomBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, refreshCart } = useCart();


  const active = tabs.find(tab => pathname.includes(tab.name))?.name;

  useEffect(()=>{
    refreshCart();
  },[])

  return (
     <SafeAreaView edges={['bottom']} style={styles.wrapper}>
    <View style={styles.nav}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.replace(tab.name === 'explore' ? '/tabs/explore' : `/tabs/${tab.name}`)}
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
    </SafeAreaView>
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
   wrapper: {
    backgroundColor: '#100e0e',
   }
});
