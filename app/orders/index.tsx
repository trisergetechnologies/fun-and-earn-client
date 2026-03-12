import { getToken } from '@/helpers/authStorage';
import { useTheme } from '@/components/ThemeContext';
import { Card, EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

interface OrderItem {
  productId: string;
  sellerId: string;
  quantity: number;
  priceAtPurchase: number;
  finalPriceAtPurchase: number;
  productTitle: string;
  productThumbnail?: string;
  returnPolicyDays: number;
}

interface Order {
  _id: string;
  buyerId: string;
  cancelRequested: boolean;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: {
    addressName: string;
    city: string;
    fullName: string;
    phone: string;
    pincode: string;
    state: string;
    street: string;
  };
  finalAmountPaid: number;
  totalAmount: number;
  totalGstAmount: number;
  deliveryCharge: number;
  usedWalletAmount: number;
  usedCouponCode: string | null;
  items: OrderItem[];
  paymentInfo: { gateway: string; paymentId: string };
  paymentStatus: 'paid' | 'unpaid' | string;
  refundStatus: string;
  returnReason: string | null;
  returnRequested: boolean;
  returnStatus: string;
  status: 'placed' | 'shipped' | 'delivered' | 'cancelled' | string;
  trackingUpdates: Array<any>;
  __v: number;
}

type Orders = Order[] | null;

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { contentPadding } = useResponsive();
  const router = useRouter();
  const [orders, setOrders] = useState<Orders>([]);

  const fetchOrders = async () => {
    const token = await getToken();
    const getOrdersUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/getorders`;
    try {
      const response = await axios.get(getOrdersUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.log(response.data);
      }
    } catch (error: any) {
      Alert.alert('Something went wrong! Please try again.');
      console.error('Failed to fetch addresses:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerRow, { paddingHorizontal: contentPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        <TouchableOpacity onPress={() => router.push('/tabs/cart')}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: contentPadding }]}
        renderItem={({ item }) => {
          const firstItem = item.items[0];
          const thumbnail = firstItem?.productThumbnail || 'https://via.placeholder.com/80';
          const productTitle = firstItem?.productTitle || 'Product';

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/orders/${item._id}`)}
            >
              <Card padding={spacing.sm + 2} style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <View style={[styles.thumbWrap, { backgroundColor: colors.backgroundSecondary }]}>
                    <Image source={{ uri: thumbnail }} style={styles.thumb} />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text numberOfLines={1} style={[styles.orderTitle, { color: colors.text }]}>
                      {productTitle}
                    </Text>
                    <Text style={[styles.orderMeta, { color: colors.textSecondary }]}>
                      ₹{item.finalAmountPaid.toFixed(2)} • {item.items.length} item(s)
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            subtitle="Your orders will appear here once you place them."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.xl + 4 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: { paddingBottom: spacing.xxl },
  orderCard: { marginBottom: spacing.sm },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  orderInfo: { flex: 1 },
  orderTitle: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
  orderMeta: { marginTop: 4, fontSize: typography.fontSize.base },
  orderDate: { fontSize: typography.fontSize.sm, marginTop: 2 },
});
