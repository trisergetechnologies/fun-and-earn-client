import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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
  compact?: boolean;
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
  const scale = useSharedValue(1);
  const wishlistScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const wishlistAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wishlistScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleWishlistPressIn = () => {
    wishlistScale.value = withSpring(0.9);
  };

  const handleWishlistPressOut = () => {
    wishlistScale.value = withSpring(1);
  };

  const hasDiscount = (product.discountPercent ?? 0) > 0;

  const cardContent = (
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
          <Pressable
            onPress={onWishlistPress}
            onPressIn={handleWishlistPressIn}
            onPressOut={handleWishlistPressOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={[styles.wishlistBtn, wishlistAnimatedStyle, { backgroundColor: colors.card }]}>
              <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
            </Animated.View>
          </Pressable>
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
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[width ? { width } : styles.wrapper]}
    >
      <Animated.View style={animatedStyle}>
        {cardContent}
      </Animated.View>
    </Pressable>
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    lineHeight: 20,
  },
  titleCompact: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
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
