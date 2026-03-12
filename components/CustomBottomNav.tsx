import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';
import { useTheme } from './ThemeContext';
import { useEffect } from 'react';

const tabs = [
  { name: 'explore', label: 'Home', icon: 'home-outline' as const },
  { name: 'rewards', label: 'Rewards', icon: 'gift-outline' as const },
  { name: 'wallet', label: 'Wallet', icon: 'wallet-outline' as const },
  { name: 'cart', label: 'Cart', icon: 'cart-outline' as const },
  { name: 'profile', label: 'Profile', icon: 'person-outline' as const },
];

export default function CustomBottomNav() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { cart, refreshCart } = useCart();

  const active = tabs.find((tab) => pathname.includes(tab.name))?.name;

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.nav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            onPress={() =>
              router.replace(tab.name === 'explore' ? '/tabs/explore' : `/tabs/${tab.name}`)
            }
            style={styles.item}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={tab.icon}
                size={24}
                color={active === tab.name ? colors.primary : colors.textMuted}
              />
              {tab.name === 'cart' && cart.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {cart.length > 99 ? '99+' : cart.length}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: active === tab.name ? colors.primary : colors.textMuted },
                active === tab.name && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  nav: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
