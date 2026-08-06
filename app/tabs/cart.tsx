import { Screen } from '@/components/Screen';
import { useCart } from '@/components/CartContext';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { CartItem } from '@/types/cart';
import {
  formatVariationLine,
  getCartItemCount,
  getCartSubtotal,
  getEstimatedTotal,
  getGstPercentLabel,
  getLineTotal,
  SAME_SELLER_CART_MESSAGE,
} from '@/utils/cartLabels';
import { formatDreamCash } from '@/utils/walletFormat';
import { getProductSellerName } from '@/utils/productSeller';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

function CartItemCard({
  item,
  busy,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  busy: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const imageUri = item.productId.images?.[0];
  const variationLine = formatVariationLine(item.selectedVariation);
  const hasDiscount = (item.productId.discountPercent ?? 0) > 0;

  return (
    <Card padding={spacing.md} style={styles.cartCard}>
      <View style={styles.cardRow}>
        <View style={[styles.imageWrap, { backgroundColor: colors.backgroundSecondary }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>
              {item.productId.title}
            </Text>
            <Pressable
              onPress={onRemove}
              disabled={busy}
              accessibilityLabel="Remove item"
              style={({ pressed }) => [
                styles.removeBtn,
                { opacity: pressed || busy ? 0.5 : 1 },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          </View>

          {variationLine ? (
            <Text numberOfLines={2} style={[styles.variationText, { color: colors.textMuted }]}>
              {variationLine}
            </Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={[styles.lineTotal, { color: colors.primary }]}>
              {formatDreamCash(getLineTotal(item))}
            </Text>
            <Text style={[styles.unitPrice, { color: colors.textMuted }]}>
              {formatDreamCash(item.productId.finalPrice)} × {item.quantity}
            </Text>
          </View>

          {hasDiscount ? (
            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
              MRP {formatDreamCash(item.productId.price * item.quantity)}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            <View
              style={[
                styles.qtyRow,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight },
              ]}
            >
              <Pressable
                onPress={onDecrease}
                disabled={busy}
                style={({ pressed }) => [
                  styles.qtyBtn,
                  { opacity: pressed || busy ? 0.5 : 1 },
                ]}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
              <Pressable
                onPress={onIncrease}
                disabled={busy}
                style={({ pressed }) => [
                  styles.qtyBtn,
                  { opacity: pressed || busy ? 0.5 : 1 },
                ]}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </Pressable>
            </View>
            {busy ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

function CartSummaryFooter({
  subtotal,
  gstAmount,
  deliveryCharge,
  estimatedTotal,
  onCheckout,
}: {
  subtotal: number;
  gstAmount: number;
  deliveryCharge: number;
  estimatedTotal: number;
  onCheckout: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
      <Card padding={spacing.md} style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatDreamCash(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            {getGstPercentLabel(subtotal, gstAmount)}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatDreamCash(gstAmount || 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatDreamCash(deliveryCharge || 0)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Estimated total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatDreamCash(estimatedTotal)}
          </Text>
        </View>
      </Card>
      <Button
        title="Proceed to Pay"
        onPress={onCheckout}
        variant="primary"
        fullWidth
        leftIcon={<Ionicons name="lock-closed" size={18} />}
        style={styles.checkoutButton}
      />
    </View>
  );
}

const CartScreen = () => {
  const { colors } = useTheme();
  const { cart, removeFromCart, refreshCart, updateQty, totalGstAmount, deliveryCharge } = useCart();

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      await refreshCart();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not load cart', text2: 'Please try again.' });
    } finally {
      setInitialLoading(false);
    }
  }, [refreshCart]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCart();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not refresh cart' });
    } finally {
      setRefreshing(false);
    }
  };

  const runCartAction = async (productId: string, action: () => Promise<void>) => {
    if (busyProductId) return;
    setBusyProductId(productId);
    try {
      await action();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not update cart', text2: 'Please try again.' });
    } finally {
      setBusyProductId(null);
    }
  };

  const increaseQty = (item: CartItem) =>
    runCartAction(item.productId._id, () => updateQty(item.productId._id, item.quantity + 1));

  const decreaseQty = (item: CartItem) => {
    if (item.quantity > 1) {
      runCartAction(item.productId._id, () => updateQty(item.productId._id, item.quantity - 1));
    } else {
      runCartAction(item.productId._id, () => removeFromCart(item.productId._id));
    }
  };

  const handleRemove = (productId: string) =>
    runCartAction(productId, () => removeFromCart(productId));

  const subtotal = getCartSubtotal(cart);
  const itemCount = getCartItemCount(cart);
  const estimatedTotal = getEstimatedTotal(subtotal, totalGstAmount, deliveryCharge);
  const cartSellerName = cart[0] ? getProductSellerName(cart[0].productId.sellerId) : null;

  const ListHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Cart</Text>
      <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
        Review items before checkout
      </Text>
      {cart.length > 0 ? (
        <View style={[styles.summaryStrip, { backgroundColor: colors.primaryTint }]}>
          <Text style={[styles.summaryStripText, { color: colors.primary }]}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatDreamCash(subtotal)} subtotal
          </Text>
        </View>
      ) : null}
      {cart.length > 0 ? (
        <View
          style={[
            styles.sellerHint,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight },
          ]}
        >
          <Ionicons name="storefront-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.sellerHintText, { color: colors.textSecondary }]}>
            {cartSellerName
              ? `Items in this cart are from ${cartSellerName} only.`
              : SAME_SELLER_CART_MESSAGE}
          </Text>
        </View>
      ) : null}
      {cart.length > 0 ? (
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>YOUR ITEMS</Text>
      ) : null}
    </View>
  );

  if (initialLoading) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (cart.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="cart-outline"
          title="Cart's feeling empty!"
          subtitle="Add items from Explore to get started"
          action={
            <Button
              variant="primary"
              title="Browse products"
              onPress={() => router.replace('/tabs/explore')}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={cart}
        keyExtractor={(item) => `${item.productId._id}`}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            busy={busyProductId === item.productId._id}
            onIncrease={() => increaseQty(item)}
            onDecrease={() => decreaseQty(item)}
            onRemove={() => handleRemove(item.productId._id)}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <CartSummaryFooter
        subtotal={subtotal}
        gstAmount={totalGstAmount}
        deliveryCharge={deliveryCharge}
        estimatedTotal={estimatedTotal}
        onCheckout={() => router.push('/private/checkout')}
      />
    </Screen>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexGrow: 1,
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
    marginBottom: spacing.md,
  },
  summaryStrip: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryStripText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  sellerHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  sellerHintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  cartCard: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageWrap: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
  removeBtn: {
    padding: spacing.xxs,
  },
  variationText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xxs,
    lineHeight: 18,
  },
  priceRow: {
    marginTop: spacing.xs,
    gap: 2,
  },
  lineTotal: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  unitPrice: {
    fontSize: typography.fontSize.sm,
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xxs,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryCard: {
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
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
  checkoutButton: {
    marginTop: spacing.xxs,
  },
});
