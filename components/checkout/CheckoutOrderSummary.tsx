import { Card } from '@/components/ui';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { CartItem } from '@/types/cart';
import {
  formatVariationLine,
  getCartItemCount,
  getCartSubtotal,
  getEstimatedTotal,
  getGstPercentLabel,
  getLineTotal,
} from '@/utils/cartLabels';
import { formatDreamCash } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  gstAmount: number;
  deliveryCharge: number;
}

function SummaryLineItem({ item }: { item: CartItem }) {
  const { colors } = useTheme();
  const imageUri = item.productId.images?.[0];
  const variationLine = formatVariationLine(item.selectedVariation);

  return (
    <View style={styles.itemRow}>
      <View style={[styles.thumbWrap, { backgroundColor: colors.backgroundSecondary }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumb} />
        ) : (
          <Ionicons name="image-outline" size={20} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.itemDetails}>
        <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>
          {item.productId.title}
        </Text>
        {variationLine ? (
          <Text numberOfLines={2} style={[styles.itemVariation, { color: colors.textMuted }]}>
            {variationLine}
          </Text>
        ) : null}
        <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
          Qty {item.quantity} · {formatDreamCash(item.productId.finalPrice)} each
        </Text>
      </View>
      <Text style={[styles.itemTotal, { color: colors.primary }]}>
        {formatDreamCash(getLineTotal(item))}
      </Text>
    </View>
  );
}

export function CheckoutOrderSummary({ cart, gstAmount, deliveryCharge }: CheckoutOrderSummaryProps) {
  const { colors } = useTheme();
  const subtotal = getCartSubtotal(cart);
  const itemCount = getCartItemCount(cart);
  const estimatedTotal = getEstimatedTotal(subtotal, gstAmount, deliveryCharge);

  return (
    <Card padding={spacing.md}>
      <View style={[styles.summaryStrip, { backgroundColor: colors.primaryTint }]}>
        <Text style={[styles.summaryStripText, { color: colors.primary }]}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatDreamCash(subtotal)} subtotal
        </Text>
      </View>

      {cart.map((item, idx) => (
        <SummaryLineItem key={`${item.productId._id}-${idx}`} item={item} />
      ))}

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.totalsRow}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>{formatDreamCash(subtotal)}</Text>
      </View>
      <View style={styles.totalsRow}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          {getGstPercentLabel(subtotal, gstAmount)}
        </Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>{formatDreamCash(gstAmount || 0)}</Text>
      </View>
      <View style={styles.totalsRow}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Delivery</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatDreamCash(deliveryCharge || 0)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.totalsRow}>
        <Text style={[styles.grandLabel, { color: colors.text }]}>Estimated total</Text>
        <Text style={[styles.grandValue, { color: colors.primary }]}>
          {formatDreamCash(estimatedTotal)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryStrip: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryStripText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 18,
  },
  itemVariation: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  itemQty: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
  },
  totalValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  grandLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  grandValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
