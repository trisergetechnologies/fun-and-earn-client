import InvoicePreview from '@/components/InvoicePreview';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { getToken } from '@/helpers/authStorage';
import {
  formatOrderDisplayId,
  getOrderStatusColors,
  getOrderStatusLabel,
  getPaymentStatusColors,
} from '@/utils/orderLabels';
import {
  downloadInvoicePdf,
  fetchInvoiceRemoteUrl,
  shareLocalPdf,
} from '@/utils/invoicePdf';
import { formatDreamCash, formatTransactionDate } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const SUPPORT_EMAIL = 'ampdreammart@gmail.com';

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
  publicOrderId?: string | null;
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
  usedWalletAmount: number;
  usedCouponCode: string | null;
  items: OrderItem[];
  paymentInfo: {
    gateway: string;
    paymentId: string;
  };
  paymentStatus: 'paid' | 'unpaid' | string;
  refundStatus: 'not_applicable' | 'pending' | 'refunded' | string;
  returnReason: string | null;
  returnRequested: boolean;
  returnStatus: 'none' | 'requested' | 'approved' | 'rejected' | string;
  status: 'placed' | 'shipped' | 'delivered' | 'cancelled' | string;
  trackingUpdates: Array<unknown>;
  __v: number;
}

function getOrderIdForCopy(order: Pick<Order, '_id' | 'publicOrderId'>) {
  return order.publicOrderId ?? order._id;
}

function ReturnPolicySection({ orderIdLabel }: { orderIdLabel: string }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.policyContainer,
        {
          backgroundColor: colors.errorMuted,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.policyHeader, { opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={styles.policyHeaderLeft}>
          <View style={[styles.policyIcon, { backgroundColor: colors.card }]}>
            <Ionicons name="return-down-back-outline" size={18} color={colors.error} />
          </View>
          <Text style={[styles.policyHeaderTitle, { color: colors.error }]}>Return & refund policy</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded ? (
        <Text style={[styles.policyBody, { color: colors.textSecondary, borderTopColor: colors.borderLight }]}>
          You may request a return within{' '}
          <Text style={{ fontWeight: typography.fontWeight.semibold, color: colors.error }}>2 days of delivery</Text>
          . To initiate, email us at{' '}
          <Text
            style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary }}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            {SUPPORT_EMAIL}
          </Text>
          . Use the subject line{' '}
          <Text style={{ fontWeight: typography.fontWeight.semibold, color: colors.text }}>
            Return Request – {orderIdLabel}
          </Text>{' '}
          and briefly describe the reason for return. Our support team will review your request and reply with next
          steps.
        </Text>
      ) : null}
    </View>
  );
}

const OrderDetails = () => {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState<'download' | 'share' | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [isInvoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    const token = await getToken();
    const getOrdersUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/getorders?id=${id}`;
    try {
      const response = await axios.get(getOrdersUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error: unknown) {
      Alert.alert('Something went wrong ! Please try again.');
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch order:', error.response?.data || error.message);
      }
    }
  }, [id]);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      await fetchOrder();
    } finally {
      setLoading(false);
    }
  }, [fetchOrder]);

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [loadOrder])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrder();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setInvoiceLoading('download');
    try {
      const token = await getToken();
      const orderId = String(id);
      const remoteUrl = await fetchInvoiceRemoteUrl(EXPO_PUBLIC_BASE_URL, orderId, token);

      setInvoiceUrl(remoteUrl);
      setInvoiceModalVisible(true);
      await downloadInvoicePdf(remoteUrl, orderId);

      setTimeout(() => {
        setInvoiceModalVisible(false);
      }, 1000);
    } catch (error) {
      console.error('Invoice download error:', error);
      setInvoiceModalVisible(false);
      const message = error instanceof Error ? error.message : '';
      if (message === 'Invoice URL not found') {
        Alert.alert('Error', 'Invoice URL not found');
      } else {
        Alert.alert('Error', 'Failed to download invoice');
      }
    } finally {
      setInvoiceLoading(null);
    }
  };

  const handleShareInvoice = async () => {
    setInvoiceLoading('share');
    try {
      const token = await getToken();
      const orderId = String(id);
      const remoteUrl = await fetchInvoiceRemoteUrl(EXPO_PUBLIC_BASE_URL, orderId, token);
      const localUri = await downloadInvoicePdf(remoteUrl, orderId);
      await shareLocalPdf(localUri);
    } catch (error) {
      console.error('Invoice share error:', error);
      const message = error instanceof Error ? error.message : '';
      if (message === 'Invoice URL not found') {
        Alert.alert('Error', 'Invoice URL not found');
      } else {
        Alert.alert('Error', 'Failed to share invoice');
      }
    } finally {
      setInvoiceLoading(null);
    }
  };

  const copyOrderId = async () => {
    if (!order) return;
    try {
      await Clipboard.setStringAsync(getOrderIdForCopy(order));
      setCopied(true);
      Toast.show({ type: 'success', text1: 'Copied', text2: 'Order ID copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const renderStatusBadge = (status: Order['status']) => {
    const { bg, text } = getOrderStatusColors(status, colors);
    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{getOrderStatusLabel(status)}</Text>
      </View>
    );
  };

  const renderPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
    const payment = getPaymentStatusColors(paymentStatus, colors);
    if (!payment) return null;
    return (
      <View style={[styles.statusBadge, { backgroundColor: payment.bg, marginLeft: spacing.xxs }]}>
        <Text style={[styles.statusBadgeText, { color: payment.text }]}>{payment.label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading order…</Text>
        </View>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <EmptyState
          icon="receipt-outline"
          title="Order not found"
          subtitle="We couldn't load this order. Please try again."
          style={styles.emptyState}
          action={<Button title="Retry" onPress={loadOrder} variant="primary" size="md" />}
        />
      </Screen>
    );
  }

  const isPaid = order.paymentStatus?.toLowerCase() === 'paid';
  const gstPercent =
    order.totalAmount > 0 ? Math.round((order.totalGstAmount / order.totalAmount) * 100) : 0;
  const displayId = formatOrderDisplayId(order);

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
        <View style={styles.headerBlock}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Order details</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            {formatTransactionDate(order.createdAt)}
          </Text>
        </View>

        <Card padding={spacing.md} style={styles.heroCard}>
          <View style={styles.orderIdRow}>
            <View style={styles.orderIdTextWrap}>
              <Text style={[styles.orderIdLabel, { color: colors.textMuted }]}>Order ID</Text>
              <Text style={[styles.orderIdValue, { color: colors.text }]}>{displayId}</Text>
            </View>
            <Pressable
              onPress={copyOrderId}
              accessibilityLabel="Copy order ID"
              style={({ pressed }) => [
                styles.copyBtn,
                {
                  backgroundColor: colors.backgroundSecondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copied ? colors.success : colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.badgeRow}>
            {renderStatusBadge(order.status)}
            {renderPaymentBadge(order.paymentStatus)}
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ITEMS</Text>
        <Card padding={spacing.md} style={styles.sectionCard}>
          {order.items.map((item, index) => (
            <View key={`${item.productId}-${index}`}>
              {index > 0 ? (
                <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
              ) : null}
              <View style={styles.productRow}>
                <View style={[styles.thumbWrap, { backgroundColor: colors.backgroundSecondary }]}>
                  {item.productThumbnail ? (
                    <Image source={{ uri: item.productThumbnail }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={[styles.productName, { color: colors.text }]}>
                    {item.productTitle}
                  </Text>
                  <Text style={[styles.productMeta, { color: colors.textSecondary }]}>
                    Qty {item.quantity}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.text }]}>
                    {formatDreamCash(item.finalPriceAtPurchase)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DELIVERY</Text>
        <Card padding={spacing.md} style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{order.deliveryAddress.fullName}</Text>
              <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
                {order.deliveryAddress.street}, {order.deliveryAddress.city} – {order.deliveryAddress.pincode}
              </Text>
              <Text style={[styles.infoBody, { color: colors.textSecondary }]}>{order.deliveryAddress.state}</Text>
            </View>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="call-outline" size={18} color={colors.textMuted} />
            </View>
            <Text style={[styles.infoBody, { color: colors.textSecondary }]}>{order.deliveryAddress.phone}</Text>
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PAYMENT SUMMARY</Text>
        <Card padding={spacing.md} style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Items total</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{formatDreamCash(order.totalAmount)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>GST ({gstPercent}%)</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {formatDreamCash(order.totalGstAmount || 0)}
            </Text>
          </View>

          {order.usedWalletAmount > 0 ? (
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Wallet used</Text>
              <Text style={[styles.rowValue, { color: colors.success }]}>
                −{formatDreamCash(order.usedWalletAmount)}
              </Text>
            </View>
          ) : null}

          {order.usedCouponCode ? (
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                Coupon ({order.usedCouponCode})
              </Text>
              <Text style={[styles.rowValue, { color: colors.success }]}>Applied</Text>
            </View>
          ) : null}

          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.rowBetween}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total paid</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              {formatDreamCash(order.finalAmountPaid)}
            </Text>
          </View>
        </Card>

        <View style={styles.invoiceSection}>
          {isPaid ? (
            <View style={styles.invoiceButtons}>
              <Button
                title="Download invoice"
                onPress={handleDownloadInvoice}
                variant="primary"
                size="md"
                style={styles.invoiceButton}
                loading={invoiceLoading === 'download'}
                disabled={invoiceLoading !== null}
                leftIcon={<Ionicons name="download-outline" size={18} />}
              />
              <Button
                title="Share invoice"
                onPress={handleShareInvoice}
                variant="outline"
                size="md"
                style={styles.invoiceButton}
                loading={invoiceLoading === 'share'}
                disabled={invoiceLoading !== null}
                leftIcon={<Ionicons name="share-outline" size={18} />}
              />
            </View>
          ) : (
            <View style={[styles.unpaidBanner, { backgroundColor: colors.warning + '18' }]}>
              <Ionicons name="time-outline" size={18} color={colors.warning} />
              <Text style={[styles.unpaidText, { color: colors.warning }]}>
                Invoice available after payment is completed
              </Text>
            </View>
          )}
        </View>

        <ReturnPolicySection orderIdLabel={displayId.replace('#', '')} />
      </ScrollView>

      <InvoicePreview
        visible={isInvoiceModalVisible}
        onClose={() => setInvoiceModalVisible(false)}
        uri={invoiceUrl}
      />
    </Screen>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
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
  heroCard: {
    marginBottom: spacing.lg,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  orderIdTextWrap: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orderIdValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
  productMeta: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  productPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xxs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  infoBody: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xxs + 2,
  },
  rowLabel: {
    fontSize: typography.fontSize.sm,
  },
  rowValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  invoiceSection: {
    marginBottom: spacing.lg,
  },
  invoiceButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invoiceButton: {
    flex: 1,
  },
  unpaidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  unpaidText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  policyContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  policyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  policyIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyHeaderTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  policyBody: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
});
