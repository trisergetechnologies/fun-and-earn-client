import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Product } from '@/types/product';
import { formatDreamCash } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ActivationExclusiveSectionProps = {
  products: Product[];
  contentPadding: number;
  onProductPress: (product: Product) => void;
  loading?: boolean;
};

function ActivationExclusiveSkeleton({
  contentPadding,
  cardWidth,
  sidePeek,
}: {
  contentPadding: number;
  cardWidth: number;
  sidePeek: number;
}) {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const bandColors = isDark
    ? [colors.primary + '33', colors.background]
    : [colors.primaryTint, colors.background];

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={bandColors} style={styles.band}>
        <View style={[styles.header, { paddingHorizontal: contentPadding }]}>
          <Animated.View
            style={[
              styles.skelTitle,
              { backgroundColor: colors.backgroundSecondary, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.skelSubtitle,
              { backgroundColor: colors.backgroundSecondary, opacity },
            ]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: Math.max(contentPadding, sidePeek),
            paddingBottom: spacing.md,
            gap: spacing.sm,
          }}
        >
          {[0, 1].map((key) => (
            <View
              key={key}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.card,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.imageWrap,
                  { backgroundColor: colors.backgroundSecondary, opacity },
                ]}
              />
              <View style={styles.ctaRow}>
                <Animated.View
                  style={[
                    styles.skelCta,
                    { backgroundColor: colors.backgroundSecondary, opacity },
                  ]}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

export function ActivationExclusiveSection({
  products,
  contentPadding,
  onProductPress,
  loading = false,
}: ActivationExclusiveSectionProps) {
  const { colors, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollingRef = useRef(false);

  const cardWidth = Math.min(SCREEN_WIDTH - contentPadding * 2, 340);
  const sidePeek = Math.max(0, (SCREEN_WIDTH - cardWidth) / 2 - 4);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / (cardWidth + spacing.sm));
      if (i !== activeIndex && i >= 0 && i < products.length) {
        setActiveIndex(i);
      }
    },
    [activeIndex, cardWidth, products.length]
  );

  if (loading) {
    return (
      <ActivationExclusiveSkeleton
        contentPadding={contentPadding}
        cardWidth={cardWidth}
        sidePeek={sidePeek}
      />
    );
  }

  if (!products.length) return null;

  const bandColors = isDark
    ? [colors.primary + '33', colors.background]
    : [colors.primaryTint, colors.background];

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={bandColors} style={styles.band}>
        <View style={[styles.header, { paddingHorizontal: contentPadding }]}>
          <View style={styles.titleRow}>
            <View style={[styles.accentDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.title, { color: colors.text }]}>Activation Exclusive</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Special picks with exclusive rewards unlocked
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + spacing.sm}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            scrollingRef.current = true;
          }}
          onMomentumScrollEnd={() => {
            scrollingRef.current = false;
          }}
          contentContainerStyle={{
            paddingHorizontal: Math.max(contentPadding, sidePeek),
            paddingBottom: spacing.md,
            gap: spacing.sm,
          }}
        >
          {products.map((product) => {
            const imageUri = product.images?.[0];
            const hasDiscount = (product.discountPercent ?? 0) > 0;

            return (
              <Pressable
                key={product._id}
                onPress={() => onProductPress(product)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    width: cardWidth,
                    backgroundColor: colors.card,
                    borderColor: colors.borderLight,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View style={styles.imageWrap}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                  ) : (
                    <View
                      style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Ionicons name="image-outline" size={36} color={colors.textMuted} />
                    </View>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.72)']}
                    style={styles.imageGradient}
                  />
                  <View style={[styles.chip, { backgroundColor: colors.primary }]}>
                    <Ionicons name="sparkles" size={12} color={colors.primaryContrast} />
                    <Text style={[styles.chipText, { color: colors.primaryContrast }]}>
                      ACTIVATION
                    </Text>
                  </View>
                  <View style={styles.imageFooter}>
                    <Text style={styles.imageTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.imagePrice}>{formatDreamCash(product.finalPrice)}</Text>
                      {hasDiscount ? (
                        <Text style={styles.imageOriginal}>{formatDreamCash(product.price)}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <View style={styles.ctaRow}>
                  <Text style={[styles.ctaLabel, { color: colors.primary }]}>View product</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {products.length > 1 ? (
          <View style={styles.dots}>
            {products.map((p, i) => (
              <View
                key={p._id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeIndex ? colors.primary : colors.borderLight,
                    width: i === activeIndex ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  band: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  skelTitle: {
    height: 20,
    width: 200,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  skelSubtitle: {
    height: 14,
    width: 260,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm + 8,
  },
  skelCta: {
    height: 14,
    width: 100,
    borderRadius: borderRadius.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm + 8,
    lineHeight: 18,
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  chip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.6,
  },
  imageFooter: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  imagePrice: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  imageOriginal: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.xs,
    textDecorationLine: 'line-through',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
