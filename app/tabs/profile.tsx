import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import { useEffect, useState } from 'react';
import { useProfile } from '@/components/ProfileContext';
import User from '../../assets/images/user.png';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import ReturnRefundPolicyModal from '@/components/ReturnRefundPolicyModal';
import ShippingPolicyModal from '@/components/ShippingPolicyModal';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userProfile, refreshUserProfile } = useProfile();

  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showReturnRefund, setReturnRefund] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(public)/signin');
  };

  useEffect(() => {
    refreshUserProfile();
  }, []);

  const options = [
    { icon: 'clipboard-outline' as const, label: 'Your Orders', route: '/orders' },
    { icon: 'card-outline' as const, label: 'Wallet Transactions', route: '/private/transactions' },
    { icon: 'business-outline' as const, label: 'Bank Details', route: '/tabs/BankScreen' },
    { icon: 'create-outline' as const, label: 'Edit Profile', route: '/private/UpdateProfile' },
    { icon: 'key-outline' as const, label: 'Change Password', route: '/private/setting' },
    { icon: 'location-outline' as const, label: 'Manage Address', route: '/private/Address' },
    { icon: 'log-out-outline' as const, label: 'Logout', route: null, isLogout: true },
    { icon: 'chatbubbles-outline' as const, label: 'Customer Support', route: '/private/CustomerSupport' },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.avatarWrap, { backgroundColor: colors.card }]}>
        <Image source={User} style={styles.avatar} />
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{userProfile?.name}</Text>
      <Text style={[styles.email, { color: colors.textMuted }]}>{userProfile?.email}</Text>

      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.option, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() =>
              opt.isLogout ? handleLogout() : opt.route && router.push(opt.route as any)
            }
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name={opt.icon}
                size={22}
                color={opt.isLogout ? colors.error : colors.primary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: opt.isLogout ? colors.error : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </View>
            {!opt.isLogout && (
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => setShowTerms(true)}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>T. & C.</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowPolicy(true)}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setReturnRefund(true)}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Return & Refund</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowShipping(true)}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Shipping Policy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandRow}>
        <Text style={[styles.brandText, { color: colors.textMuted }]}>
          AARUSH MP DREAMS (OPC) PRIVATE LIMITED
        </Text>
      </View>

      <PrivacyPolicyModal visible={showPolicy} onClose={() => setShowPolicy(false)} />
      <TermsAndConditionsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <ReturnRefundPolicyModal visible={showReturnRefund} onClose={() => setReturnRefund(false)} />
      <ShippingPolicyModal visible={showShipping} onClose={() => setShowShipping(false)} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarWrap: {
    borderRadius: 50,
    padding: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 28,
  },
  options: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 28,
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  brandRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
