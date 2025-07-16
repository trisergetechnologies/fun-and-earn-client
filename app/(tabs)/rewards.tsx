import { getToken } from '@/helpers/authStorage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
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

const mockCoupons: Coupon[] = [
  {
    _id: '1',
    code: 'SV1000BONUS',
    title: '₹1000 for Short Videos',
    description: 'Earned via watch time. Use in Short Video wallet.',
    earnedBy: 'user123',
    isActive: true,
    isRedeemed: false,
    value: 1000,
    createdAt: new Date(),
    expiresAt: '2025-08-01',
  },
  {
    _id: '2',
    code: 'FLAT300',
    title: '₹300 Off on Cart',
    description: 'Applicable on orders above ₹999',
    earnedBy: 'user123',
    earnedFromOrder: 'order#1281',
    isActive: false,
    isRedeemed: true,
    value: 300,
    createdAt: new Date(),
    expiresAt: '2025-07-25',
  },
];

const RewardScreen = () => {

  const [coupons, setCoupons] = useState<Coupon[] | null>(null);

  const fetchCoupons = async () => {
    const token = await getToken();
    const getCouponsUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/getrewards`;
    try {
      const response = await axios.get(getCouponsUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  }

  useEffect(()=>{
    fetchCoupons();
  })

  const renderHeader = () => (
    <View>
      <Text style={styles.header}>🎁 Your Rewards & Offers</Text>
      <Text style={styles.sectionTitle}>Available Coupons</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Coupon }) => (
    <View style={styles.couponCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.couponTitle}>{item.title}</Text>
        <Text style={styles.couponCode}>
          Use Code: <Text style={styles.codeText}>{item.code}</Text>
        </Text>
        <Text style={styles.couponDesc}>{item.description}</Text>
        <Text style={styles.metaText}>Value: ₹{item.value}</Text>
        {item.expiresAt && (
          <Text style={styles.metaText}>
            Expires on: {new Date(item.expiresAt).toLocaleDateString()}
          </Text>
        )}
        {item.isRedeemed ? (
          <Text style={styles.redeemed}>✅ Already Redeemed</Text>
        ) : (
          <Text
            style={[
              styles.activeLabel,
              { color: item.isActive ? 'green' : 'red' },
            ]}
          >
            {item.isActive ? 'Active' : 'Not Active'}
          </Text>
        )}
      </View>

      {!item.isRedeemed && (
        <TouchableOpacity
          disabled={!item.isActive}
          style={[
            styles.applyButton,
            { opacity: item.isActive ? 1 : 0.5 },
          ]}
          onPress={() => {
            // Copy logic can go here
            console.log('Copied:', item.code);
          }}
        >
          <Text style={styles.applyText}>Copy Code</Text>
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
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No Coupons Available</Text>
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
    backgroundColor: '#f9f9f9',
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 13,
    color: '#555',
  },
  codeText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  couponDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
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
    marginTop: 4,
  },
  redeemed: {
    marginTop: 6,
    color: 'green',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
});
