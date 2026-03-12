import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import { SelectedVariation } from '../components/CartContext';
import { useTheme } from '@/components/ThemeContext';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';

const { height } = Dimensions.get('window');

interface ProductVariation {
  name: string;
  options: string[];
}

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    __v: number;
    _id: string;
    categoryId: string;
    createdAt: string;
    createdByRole: string;
    description: string;
    discountPercent: number;
    finalPrice: number;
    images: string[];
    isActive: boolean;
    price: number;
    sellerId: string;
    stock: number;
    title: string;
    updatedAt: string;
    variations?: ProductVariation[];
  } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(height);
  const { addToCart } = useCart();
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  React.useEffect(() => {
    translateY.value = withTiming(visible ? height * 0.08 : height, { duration: 320 });
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      setSelectedVariations({});
    }
  }, [visible, product?._id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!product) return null;

  const hasVariations = product.variations && product.variations.length > 0;
  const allVariationsSelected = hasVariations
    ? product.variations!.every((v) => selectedVariations[v.name])
    : true;

  const handleAddToCart = () => {
    if (hasVariations && !allVariationsSelected) {
      Alert.alert('Select Options', 'Please select all product options before adding to cart.');
      return;
    }

    const variationArr: SelectedVariation[] = hasVariations
      ? product.variations!.map((v) => ({ name: v.name, value: selectedVariations[v.name] }))
      : [];

    addToCart(product, variationArr);
    Alert.alert('Cart', `${product.title} added to cart`);
    onClose();
  };

  return (
    <>
      {visible && (
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
          />
        </Pressable>
      )}
      <Animated.View style={[styles.modalContainer, animatedStyle, { backgroundColor: colors.card }]}>
        <View style={styles.modalContent}>
        <TouchableOpacity
          style={[styles.closeIcon, { backgroundColor: colors.errorMuted }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={colors.error} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.imageWrap, { backgroundColor: colors.backgroundSecondary }]}>
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          </View>

          <Text style={[styles.productName, { color: colors.text }]}>{product.title}</Text>

          <View style={styles.priceRow}>
            {product.discountPercent > 0 && (
              <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                ₹{product.price}
              </Text>
            )}
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              ₹{product.finalPrice}
            </Text>
            {product.discountPercent > 0 && (
              <View style={[styles.discountBadge, { backgroundColor: colors.successMuted }]}>
                <Text style={[styles.discountBadgeText, { color: colors.success }]}>
                  {product.discountPercent}% OFF
                </Text>
              </View>
            )}
          </View>

          {hasVariations &&
            product.variations!.map((variation) => (
              <View key={variation.name} style={styles.variationSection}>
                <Text style={[styles.variationLabel, { color: colors.text }]}>
                  {variation.name}
                </Text>
                <View style={styles.variationOptions}>
                  {variation.options.map((option) => {
                    const isSelected = selectedVariations[variation.name] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.variationChip,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primaryTint : colors.backgroundSecondary,
                          },
                        ]}
                        onPress={() =>
                          setSelectedVariations((prev) => ({
                            ...prev,
                            [variation.name]: option,
                          }))
                        }
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
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          <View style={styles.buttonRow}>
            <Button
              variant="primary"
              title="Add to Cart"
              onPress={handleAddToCart}
              disabled={!allVariationsSelected}
              leftIcon={<Ionicons name="cart" size={20} color={colors.primaryContrast} />}
              style={styles.cartButton}
            />
          </View>
        </ScrollView>
        </View>
      </Animated.View>
    </>
  );
};

export default ProductModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 16,
    zIndex: 100,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 24,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  variationSection: {
    marginBottom: 18,
  },
  variationLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  variationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  variationChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  variationChipTextBold: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonRow: {
    marginTop: 28,
    alignItems: 'center',
  },
  cartButton: {
    minWidth: 220,
  },
});
