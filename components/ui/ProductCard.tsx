import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, typography } from '@/constants/DesignSystem';
import { Badge } from './Badge';
import { Ionicons } from '@expo/vector-icons';

export interface ProductCardData {
  _id: string;
  title: string;
  price: number;
  finalPrice: number;
  discountPercent?: number;
  images: string[];
}

interface ProductCardProps {
  product: ProductCardData;
  onPress: () => void;
  onWishlistPress?: () => void;
  /** Compact horizontal layout (e.g. for "Today's Picks") */
  compact?: boolean;
  /** Card width (for grid); if not set, uses flex. */
  width?: number;
}

export function ProductCard({
  product,
  onPress,
  onWishlistPress,
  compact = false,
  width,
}: ProductCardProps) {
  const { colors } = useTheme();
  const hasDiscount = (product.discountPercent ?? 0) > 0;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          width: width ?? undefined,
        },
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: colors.backgroundSecondary }]}>
        <Image
          source={{ uri: product.images[0] }}
          style={compact ? styles.imageCompact : styles.image}
          resizeMode="cover"
        />
        {hasDiscount && (
          <View style={styles.badgeWrap}>
            <Badge label={`${product.discountPercent}% OFF`} variant="discount" />
          </View>
        )}
        {onWishlistPress && (
          <TouchableOpacity
            onPress={onWishlistPress}
            style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.details}>
        <Text
          style={[compact ? styles.titleCompact : styles.title, { color: colors.text }]}
          numberOfLines={compact ? 1 : 2}
        >
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>₹{product.finalPrice}</Text>
          {hasDiscount && (
            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₹{product.price}</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={width ? { width } : styles.wrapper}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.sm,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.92,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCompact: {
    width: '100%',
    height: '100%',
  },
  badgeWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 18,
  },
  titleCompact: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  price: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'line-through',
  },
});
