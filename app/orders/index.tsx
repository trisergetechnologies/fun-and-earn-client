import { getToken } from '@/helpers/authStorage';
import { useTheme } from '@/components/ThemeContext';
import { Screen } from '@/components/Screen';
import { Button, Card, EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import {
  formatOrderDisplayId,
  getMoreItemsLabel,
  getOrderStatusColors,
  getOrderStatusLabel,
  getOrderSummaryLine,
  getPaymentStatusColors,
  OrderListItem,
} from '@/utils/orderLabels';
import { formatTransactionDate } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const PAGE_SIZE = 20;

interface PaginatedOrdersResponse {
  success: boolean;
  data: OrderListItem[];
  hasMore?: boolean;
  total?: number;
  count?: number;
}

function isPaginatedResponse(data: PaginatedOrdersResponse) {
  return typeof data.hasMore === 'boolean' || typeof data.total === 'number';
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const legacyAllRef = useRef<OrderListItem[] | null>(null);
  const loadingMoreRef = useRef(false);

  const applyPage = useCallback(
    (responseData: PaginatedOrdersResponse, pageNum: number, append: boolean) => {
      const batch = responseData.data ?? [];

      if (!isPaginatedResponse(responseData)) {
        if (pageNum === 1) legacyAllRef.current = batch;
        const all = legacyAllRef.current ?? batch;
        const start = (pageNum - 1) * PAGE_SIZE;
        const slice = all.slice(start, start + PAGE_SIZE);
        setHasMore(start + PAGE_SIZE < all.length);
        setOrders((prev) => (append && pageNum > 1 ? [...prev, ...slice] : slice));
        return;
      }

      setHasMore(Boolean(responseData.hasMore));
      setOrders((prev) => (append && pageNum > 1 ? [...prev, ...batch] : batch));
    },
    []
  );

  const fetchOrders = useCallback(
    async (pageNum: number, append: boolean) => {
      const token = await getToken();
      const response = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/order/getorders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: PAGE_SIZE },
      });

      if (response.data.success) {
        applyPage(response.data, pageNum, append);
        setPage(pageNum);
      }
    },
    [applyPage]
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    legacyAllRef.current = null;
    try {
      await fetchOrders(1, false);
    } catch (error: any) {
      Alert.alert('Something went wrong', 'Could not load your orders. Please try again.');
      console.error('Failed to fetch orders:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    legacyAllRef.current = null;
    try {
      await fetchOrders(1, false);
    } catch (error: any) {
      Alert.alert('Something went wrong', 'Could not refresh orders.');
      console.error('Failed to refresh orders:', error.response?.data || error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMoreRef.current || loading) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchOrders(page + 1, true);
    } catch (error: any) {
      console.error('Failed to load more orders:', error.response?.data || error.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const renderStatusBadge = (status: OrderListItem['status']) => {
    const { bg, text } = getOrderStatusColors(status, colors);
    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{getOrderStatusLabel(status)}</Text>
      </View>
    );
  };

  const renderPaymentBadge = (paymentStatus: OrderListItem['paymentStatus']) => {
    const payment = getPaymentStatusColors(paymentStatus, colors);
    if (!payment) return null;
    return (
      <View style={[styles.statusBadge, { backgroundColor: payment.bg, marginLeft: spacing.xxs }]}>
        <Text style={[styles.statusBadgeText, { color: payment.text }]}>{payment.label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const firstItem = item.items[0];
    const productTitle = firstItem?.productTitle || 'Order items';
    const moreItems = getMoreItemsLabel(item.items.length);
    const thumbnail = firstItem?.productThumbnail;

    return (
      <Pressable
        onPress={() => router.push(`/orders/${item._id}`)}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <Card padding={spacing.md} style={styles.orderCard}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.orderId, { color: colors.textSecondary }]}>
              {formatOrderDisplayId(item)}
            </Text>
            <View style={styles.badgeRow}>
              {renderStatusBadge(item.status)}
              {renderPaymentBadge(item.paymentStatus)}
            </View>
          </View>

          <View style={styles.orderRow}>
            <View style={[styles.thumbWrap, { backgroundColor: colors.backgroundSecondary }]}>
              {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
                </View>
              )}
            </View>

            <View style={styles.orderInfo}>
              <Text numberOfLines={2} style={[styles.orderTitle, { color: colors.text }]}>
                {productTitle}
              </Text>
              {moreItems ? (
                <Text style={[styles.moreItems, { color: colors.textMuted }]}>{moreItems}</Text>
              ) : null}
              <Text style={[styles.orderMeta, { color: colors.textSecondary }]}>
                {getOrderSummaryLine(item)}
              </Text>
              <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                {formatTransactionDate(item.createdAt)}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>
      </Pressable>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>My orders</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            Track deliveries and order history
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/tabs/cart')}
          style={({ pressed }) => [
            styles.cartBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name="cart-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (!hasMore && orders.length > 0) {
      return (
        <Text style={[styles.endText, { color: colors.textMuted }]}>You&apos;ve reached the end</Text>
      );
    }
    return null;
  };

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No orders yet"
              subtitle="Your orders will appear here once you place them."
              style={styles.emptyState}
              action={
                <Button
                  title="Browse products"
                  onPress={() => router.push('/tabs/explore')}
                  variant="primary"
                  size="md"
                />
              }
            />
          }
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  orderCard: {
    marginBottom: spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  orderId: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  orderTitle: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
    lineHeight: 20,
  },
  moreItems: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  orderMeta: {
    marginTop: spacing.xxs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  endText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
});
