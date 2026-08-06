import React, { useEffect, useMemo, useState } from 'react';
import { useCart, Product as CartProduct } from '../components/CartContext';
import { SelectedVariation } from '../components/CartContext';
import { useTheme } from '@/components/ThemeContext';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '@/components/ui';
import { ProductImageCarousel } from '@/components/ui/ProductImageCarousel';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Product } from '@/types/product';
import { getProductSellerId, getProductSellerName } from '@/utils/productSeller';
import { hasDifferentSeller, SAME_SELLER_CART_MESSAGE } from '@/utils/cartLabels';
import { formatDreamCash } from '@/utils/walletFormat';
import { normalizeProductDescription } from '@/utils/productDescription';
import Toast from 'react-native-toast-message';

const BACKDROP_CLOSE_DELAY_MS = 150;
/** Fixed sheet height — always opens to the same size, well over half the screen */
const SHEET_HEIGHT_RATIO = 0.82;
/** Share of sheet height reserved for the image carousel (image + dots) */
const CAROUSEL_HEIGHT_RATIO = 0.38;

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
  const { colors, isDark } = useTheme();
  const { addToCart, cart } = useCart();
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [backdropReady, setBackdropReady] = useState(false);
  const [adding, setAdding] = useState(false);

  const sheetHeight = useMemo(
    () => Math.round(screenHeight * SHEET_HEIGHT_RATIO),
    [screenHeight]
  );

  const carouselHeight = useMemo(() => {
    const fromSheet = Math.round(sheetHeight * CAROUSEL_HEIGHT_RATIO);
    const fromWidth = Math.round(screenWidth * 0.92);
    return Math.min(fromSheet, fromWidth);
  }, [sheetHeight, screenWidth]);

  useEffect(() => {
    if (!visible || !product) {
      setBackdropReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setBackdropReady(true);
    }, BACKDROP_CLOSE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [visible, product?._id]);

  useEffect(() => {
    if (visible && product) {
      setSelectedVariations({});
    }
  }, [visible, product?._id]);

  const handleBackdropPress = () => {
    if (!backdropReady) return;
    onClose();
  };

  if (!product) return null;

  const sellerName = getProductSellerName(product.sellerId);
  const productSellerId = getProductSellerId(product.sellerId);
  const sellerMismatch = hasDifferentSeller(cart, productSellerId);
  const hasVariations = product.variations && product.variations.length > 0;
  const allVariationsSelected = hasVariations
    ? product.variations!.every((v) => selectedVariations[v.name])
    : true;
  const hasDiscount = (product.discountPercent ?? 0) > 0;
  const inStock = product.stock > 0;
  const footerPaddingBottom = Math.max(insets.bottom, spacing.sm) + spacing.sm;
  const descriptionText = normalizeProductDescription(product.description);

  const handleAddToCart = async () => {
    if (hasVariations && !allVariationsSelected) {
      Alert.alert('Select Options', 'Please select all product options before adding to cart.');
      return;
    }

    if (sellerMismatch) {
      Alert.alert('Different seller', SAME_SELLER_CART_MESSAGE);
      return;
    }

    const variationArr: SelectedVariation[] = hasVariations
      ? product.variations!.map((v) => ({ name: v.name, value: selectedVariations[v.name] }))
      : [];

    setAdding(true);
    try {
      const result = await addToCart(product as CartProduct, variationArr);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Added to cart',
          text2: product.title,
        });
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Could not add to cart',
          text2: result.message,
        });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
          />
        </Pressable>

        <View
          style={[
            styles.modalContainer,
            {
              height: sheetHeight,
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={[styles.handle, { backgroundColor: colors.borderLight }]} />
          </View>

          <View
            style={[styles.imageSection, { backgroundColor: colors.backgroundSecondary }]}
          >
            <ProductImageCarousel
              images={product.images}
              containerWidth={screenWidth}
              height={carouselHeight}
              borderRadius={0}
              resizeMode="contain"
              enableCarousel
            />
          </View>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
            bounces
            nestedScrollEnabled
          >
            <Text style={[styles.productName, { color: colors.text }]}>{product.title}</Text>

            <View style={styles.metaRow}>
              {sellerName ? (
                <View
                  style={[styles.metaPill, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>
                    {sellerName}
                  </Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: inStock ? colors.success + '14' : colors.error + '14',
                  },
                ]}
              >
                <Ionicons
                  name={inStock ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={inStock ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.metaPillText,
                    { color: inStock ? colors.success : colors.error },
                  ]}
                >
                  {inStock
                    ? product.stock <= 5
                      ? `Only ${product.stock} left`
                      : 'In stock'
                    : 'Out of stock'}
                </Text>
              </View>
            </View>

            {hasVariations ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                  SELECT OPTIONS
                </Text>
                {product.variations!.map((variation) => {
                  const isMissing = !selectedVariations[variation.name];
                  return (
                    <View key={variation.name} style={styles.variationSection}>
                      <Text style={[styles.variationLabel, { color: colors.text }]}>
                        {variation.name}
                      </Text>
                      {isMissing ? (
                        <Text style={[styles.variationHint, { color: colors.warning }]}>
                          Please select {variation.name.toLowerCase()}
                        </Text>
                      ) : null}
                      <View style={styles.variationOptions}>
                        {variation.options.map((option) => {
                          const isSelected = selectedVariations[variation.name] === option;
                          return (
                            <Pressable
                              key={option}
                              onPress={() =>
                                setSelectedVariations((prev) => ({
                                  ...prev,
                                  [variation.name]: option,
                                }))
                              }
                              style={[
                                styles.variationChip,
                                {
                                  borderColor: isSelected ? colors.primary : colors.border,
                                  backgroundColor: isSelected
                                    ? colors.primaryTint
                                    : colors.card,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.variationChipText,
                                  { color: isSelected ? colors.primary : colors.textSecondary },
                                  isSelected && styles.variationChipTextBold,
                                ]}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {sellerMismatch ? (
              <View
                style={[
                  styles.sellerWarning,
                  { backgroundColor: colors.warning + '18', borderColor: colors.warning + '40' },
                ]}
              >
                <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
                <Text style={[styles.sellerWarningText, { color: colors.textSecondary }]}>
                  {SAME_SELLER_CART_MESSAGE}
                </Text>
              </View>
            ) : null}

            <View style={[styles.sectionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DESCRIPTION</Text>
              {descriptionText ? (
                <View style={styles.descriptionBody}>
                  {descriptionText.split('\n').map((line, index) => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                      return <View key={`gap-${index}`} style={styles.descriptionGap} />;
                    }
                    return (
                      <Text
                        key={`line-${index}`}
                        style={[styles.productDescription, { color: colors.textSecondary }]}
                        selectable
                      >
                        {trimmed}
                      </Text>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyDescription}>
                  <Ionicons name="document-text-outline" size={20} color={colors.textMuted} />
                  <Text style={[styles.emptyDescriptionText, { color: colors.textMuted }]}>
                    No description available for this product.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                borderTopColor: colors.borderLight,
                backgroundColor: colors.card,
                paddingBottom: footerPaddingBottom,
              },
            ]}
          >
            <View style={styles.footerPriceRow}>
              <View style={styles.footerPriceBlock}>
                <Text style={[styles.footerPriceLabel, { color: colors.textMuted }]}>Price</Text>
                <View style={styles.footerPriceValues}>
                  <Text style={[styles.footerPrice, { color: colors.primary }]}>
                    {formatDreamCash(product.finalPrice)}
                  </Text>
                  {hasDiscount ? (
                    <Text style={[styles.footerOriginalPrice, { color: colors.textMuted }]}>
                      {formatDreamCash(product.price)}
                    </Text>
                  ) : null}
                </View>
              </View>
              {hasDiscount ? (
                <Badge label={`${product.discountPercent}% OFF`} variant="discount" />
              ) : null}
            </View>
            <Button
              title={
                !inStock
                  ? 'Out of stock'
                  : sellerMismatch
                    ? 'Different seller in cart'
                    : 'Add to cart'
              }
              onPress={handleAddToCart}
              disabled={!allVariationsSelected || sellerMismatch || !inStock}
              loading={adding}
              variant="primary"
              fullWidth
              leftIcon={
                !adding && inStock ? <Ionicons name="cart-outline" size={18} /> : undefined
              }
            />
          </View>

          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.closeFab,
              {
                opacity: pressed ? 0.85 : 1,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    flexDirection: 'column',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexShrink: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
  },
  closeFab: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 20,
    elevation: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  imageSection: {
    flexShrink: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsScroll: {
    flex: 1,
    minHeight: 0,
  },
  detailsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  productName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  metaPillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
  },
  variationSection: {
    gap: spacing.xs,
  },
  variationLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  variationHint: {
    fontSize: typography.fontSize.xs,
  },
  variationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  variationChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  variationChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  variationChipTextBold: {
    fontWeight: typography.fontWeight.bold,
  },
  sellerWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  sellerWarningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 19,
  },
  productDescription: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  descriptionBody: {
    gap: spacing.xs,
  },
  descriptionGap: {
    height: spacing.xs,
  },
  emptyDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyDescriptionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  footerPriceBlock: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  footerPriceValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerPrice: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  footerOriginalPrice: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'line-through',
  },
});
