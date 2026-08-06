import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';
import { useTheme } from './ThemeContext';
import { useEffect } from 'react';
import { getCartItemCount } from '@/utils/cartLabels';

const TAB_ROUTES = {
  explore: '/tabs/explore',
  rewards: '/tabs/rewards',
  wallet: '/tabs/wallet',
  cart: '/tabs/cart',
  profile: '/tabs/profile',
} as const;

type TabName = keyof typeof TAB_ROUTES;

const tabs: {
  name: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'explore', label: 'Home', icon: 'home-outline' },
  { name: 'rewards', label: 'Rewards', icon: 'gift-outline' },
  { name: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  { name: 'cart', label: 'Cart', icon: 'cart-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];

/** Flow screens where the tab bar should not appear */
const HIDDEN_PREFIXES = ['/private/checkout', '/private/success'];

function isOnTab(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function getActiveTab(pathname: string): TabName | null {
  const match = (Object.entries(TAB_ROUTES) as [TabName, string][]).find(([, route]) =>
    isOnTab(pathname, route)
  );
  return match?.[0] ?? null;
}

export default function CustomBottomNav() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { cart, refreshCart } = useCart();

  const active = getActiveTab(pathname);
  const cartCount = getCartItemCount(cart);
  const hideNav = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    refreshCart();
  }, []);

  if (hideNav) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.nav}>
        {tabs.map((tab) => {
          const isActive = active === tab.name;
          const route = TAB_ROUTES[tab.name];

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => {
                if (isOnTab(pathname, route)) return;
                router.replace(route);
              }}
              style={styles.item}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                {tab.name === 'cart' && cartCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isActive ? colors.primary : colors.textMuted },
                  isActive && styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
