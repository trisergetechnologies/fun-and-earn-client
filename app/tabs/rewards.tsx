import { getToken } from '@/helpers/authStorage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

interface Coupon {
  _id?: string;
  code: string;
  title?: string;
  description?: string;
  earnedBy: string;
  earnedFromOrder?: string;
  isActive: boolean;
  isRedeemed: boolean;
  value: number;
  expiresAt?: Date | string;
  createdAt?: Date | string;
}

const RewardScreen = () => {
  const { colors } = useTheme();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [copied, setCopied] = useState<string>('');

  const fetchCoupons = async () => {
    const token = await getToken();
    const getCouponsUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/getrewards`;
    try {
      const response = await axios.get(getCouponsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCoupons();
    }, [])
  );

  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied('Copied');
      setTimeout(() => setCopied(''), 4000);
    } catch (error) {
      console.log(error);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.headerIconWrap}>
        <Ionicons name="gift" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.header, { color: colors.text }]}>Your Rewards & Offers</Text>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Available Coupons</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Coupon }) => (
    <View
      style={[
        styles.couponCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.couponContent}>
        <Text style={[styles.couponTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.couponCode, { color: colors.textSecondary }]}>
          Use Code: <Text style={[styles.codeText, { color: colors.primary }]}>{item.code}</Text>
        </Text>
        <Text style={[styles.couponDesc, { color: colors.textMuted }]}>{item.description}</Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          <Ionicons name="pricetag" size={14} color={colors.success} /> Value: ₹{item.value}
        </Text>
        {item.expiresAt && (
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            Expires: {new Date(item.expiresAt).toLocaleDateString()}
          </Text>
        )}
        {item.isRedeemed ? (
          <Text style={[styles.redeemed, { color: colors.success }]}>Already Redeemed</Text>
        ) : (
          <Text
            style={[
              styles.activeLabel,
              { color: item.isActive ? colors.success : colors.error },
            ]}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        )}
      </View>
      {!item.isRedeemed && (
        <TouchableOpacity
          disabled={!item.isActive}
          style={[
            styles.applyButton,
            { backgroundColor: colors.primary, opacity: item.isActive ? 1 : 0.5 },
          ]}
          onPress={() => copyToClipboard(item.code)}
          activeOpacity={0.85}
        >
          <Ionicons name="copy-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.applyText}>{copied ? copied : 'Copy Code'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaProvider>
      <FlatList
        data={coupons}
        keyExtractor={(item) => item._id || item.code}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No Coupons Available
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaProvider>
  );
};

export default RewardScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 100,
  },
  headerWrap: {
    marginBottom: 20,
  },
  headerIconWrap: {
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  couponCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  couponContent: {
    flex: 1,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 13,
  },
  codeText: {
    fontWeight: '700',
  },
  couponDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    marginTop: 4,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  redeemed: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyBox: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});
