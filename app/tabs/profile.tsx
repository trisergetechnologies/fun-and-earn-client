import { ProfileLegalFooter } from '@/components/ProfileLegalFooter';
import { useProfile } from '@/components/ProfileContext';
import SimpleSpinner from '@/components/SimpleSpinner';
import { Screen } from '@/components/Screen';
import { ThemePickerModal } from '@/components/ThemePickerModal';
import { WalletBalanceHero } from '@/components/WalletBalanceHero';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card } from '@/components/ui';
import { ThemePreference } from '@/constants/Theme';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import ReturnRefundPolicyModal from '@/components/ReturnRefundPolicyModal';
import ShippingPolicyModal from '@/components/ShippingPolicyModal';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import User from '../../assets/images/user.png';

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  value?: string;
  onPress?: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function ProfileMenuRow({
  item,
  isLast,
  onPress,
}: {
  item: MenuItem;
  isLast: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
      <View style={styles.menuRight}>
        {item.value ? (
          <Text style={[styles.menuValue, { color: colors.textMuted }]}>{item.value}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

function ProfileMenuSection({
  section,
  onItemPress,
}: {
  section: MenuSection;
  onItemPress: (item: MenuItem) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
      <Card padding={0} elevated={false}>
        {section.items.map((item, index) => (
          <ProfileMenuRow
            key={item.label}
            item={item}
            isLast={index === section.items.length - 1}
            onPress={() => onItemPress(item)}
          />
        ))}
      </Card>
    </View>
  );
}

const ProfileScreen = () => {
  const { colors, themePreference } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const { userProfile, refreshUserProfile, profileLoading } = useProfile();

  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showReturnRefund, setReturnRefund] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(public)/signin');
        },
      },
    ]);
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.onPress) {
      item.onPress();
      return;
    }
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const walletBalance = userProfile?.wallets?.eCartWallet ?? 0;

  const sections: MenuSection[] = [
    {
      title: 'SHOPPING',
      items: [
        { icon: 'clipboard-outline', label: 'Your orders', route: '/orders' },
        { icon: 'location-outline', label: 'Manage address', route: '/private/Address' },
      ],
    },
    {
      title: 'WALLET & PAYMENTS',
      items: [
        { icon: 'wallet-outline', label: 'Wallet', route: '/tabs/wallet' },
        { icon: 'receipt-outline', label: 'Transaction history', route: '/private/transactions' },
        { icon: 'business-outline', label: 'Bank details', route: '/tabs/BankScreen' },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { icon: 'create-outline', label: 'Edit profile', route: '/private/UpdateProfile' },
        { icon: 'key-outline', label: 'Change password', route: '/private/setting' },
        {
          icon: 'moon-outline',
          label: 'Theme',
          value: THEME_LABELS[themePreference],
          onPress: () => setShowThemeModal(true),
        },
        { icon: 'chatbubbles-outline', label: 'Customer support', route: '/private/CustomerSupport' },
      ],
    },
  ];

  if (profileLoading && !userProfile) {
    return (
      <Screen>
        <View style={styles.loaderWrap}>
          <SimpleSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
          Your account & preferences
        </Text>

        {/* Profile hero */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
          ]}
        >
          <View style={[styles.heroAccent, { backgroundColor: colors.primary }]} />
          <View style={styles.heroBody}>
            <View style={styles.heroRow}>
              <View style={[styles.avatarRing, { borderColor: colors.borderLight }]}>
                {userProfile?.name ? (
                  <View style={[styles.initialsWrap, { backgroundColor: colors.primaryTint }]}>
                    <Text style={[styles.initials, { color: colors.primary }]}>
                      {getInitials(userProfile.name)}
                    </Text>
                  </View>
                ) : (
                  <Image source={User} style={styles.avatar} />
                )}
              </View>
              <View style={styles.heroInfo}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {userProfile?.name || 'Guest'}
                </Text>
                {userProfile?.email ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                    {userProfile.email}
                  </Text>
                ) : null}
                {userProfile?.phone ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]}>{userProfile.phone}</Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/private/UpdateProfile')}
              style={({ pressed }) => [
                styles.editLink,
                { borderTopColor: colors.borderLight, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.editLinkText, { color: colors.primary }]}>Edit profile</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <WalletBalanceHero
          compact
          balance={walletBalance}
          onPress={() => router.push('/tabs/wallet')}
        />

        {sections.map((section) => (
          <ProfileMenuSection
            key={section.title}
            section={section}
            onItemPress={handleMenuPress}
          />
        ))}

        <Button
          title="Log out"
          onPress={handleLogout}
          variant="dangerSoft"
          fullWidth
          size="lg"
          style={{ marginTop: spacing.sm }}
          leftIcon={<Ionicons name="log-out-outline" size={18} />}
        />

        <ProfileLegalFooter
          onTerms={() => setShowTerms(true)}
          onPrivacy={() => setShowPolicy(true)}
          onReturnRefund={() => setReturnRefund(true)}
          onShipping={() => setShowShipping(true)}
        />

        <PrivacyPolicyModal visible={showPolicy} onClose={() => setShowPolicy(false)} />
        <TermsAndConditionsModal visible={showTerms} onClose={() => setShowTerms(false)} />
        <ReturnRefundPolicyModal visible={showReturnRefund} onClose={() => setReturnRefund(false)} />
        <ShippingPolicyModal visible={showShipping} onClose={() => setShowShipping(false)} />
        <ThemePickerModal visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
      </ScrollView>
    </Screen>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroAccent: {
    height: 3,
    width: '100%',
  },
  heroBody: {
    padding: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarRing: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    padding: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  initialsWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  heroInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editLinkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuValue: {
    fontSize: typography.fontSize.sm,
  },
});
