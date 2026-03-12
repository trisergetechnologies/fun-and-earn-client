import { useAuth } from '@/components/AuthContext';
import ProductModal from '@/components/ProductModal';
import SimpleSpinner from '@/components/SimpleSpinner';
import { useTheme } from '@/components/ThemeContext';
import { ProductCard, ProductGridSkeleton } from '@/components/ui';
import { getToken } from '@/helpers/authStorage';
import { spacing, borderRadius, typography, shadows } from '@/constants/DesignSystem';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const CARD_GAP = 12;
const SUGGESTION_CARD_WIDTH = 156;

type Product = {
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
  variations?: { name: string; options: string[] }[];
};

const ExploreScreen = () => {
  const { colors } = useTheme();
  const { contentPadding, productColumns, width: screenWidth } = useResponsive();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [sampleCategories, setSampleCategories] = useState(null);

  const gridCardWidth =
    (screenWidth - 2 * contentPadding - (productColumns - 1) * CARD_GAP) / productColumns;

  const matchedProducts = sampleProducts.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const fetchProducts = async () => {
    setLoading(true);
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/product/products`;
    const token = await getToken();
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSampleProducts(response.data.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/categories`;
    const token = await getToken();
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedCategories = response.data.data.map((item: any) => ({
        id: item._id,
        name: item.title,
        slug: item.slug,
        image: 'https://via.placeholder.com/150',
        ownerId: item.ownerId || 'unknown',
      }));
      setSampleCategories(formattedCategories);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchProducts();
    }, [])
  );

  if (isAuthLoading) return <SimpleSpinner />;

  const renderCategory = ({ item }: { item: any }) => {
    const iconUri = item.icon?.trim()
      ? item.icon
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name.charAt(0))}&background=572fff&color=fff&size=128&font-size=0.5`;

    return (
      <TouchableOpacity
        style={[styles.categoryItem, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/private/category?slug=${item.slug}`)}
        activeOpacity={0.8}
      >
        <View style={[styles.categoryIconWrap, { backgroundColor: colors.backgroundSecondary }]}>
          <Image source={{ uri: iconUri }} style={styles.categoryIcon} />
        </View>
        <Text style={[styles.categoryText, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleWishlistPress = () => {
    Toast.show({ type: 'info', text1: 'Wishlist', text2: 'Coming soon!', position: 'bottom' });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productWrapper, { width: gridCardWidth }]}>
      <ProductCard
        product={item}
        onPress={() => setSelectedProduct(item)}
        onWishlistPress={handleWishlistPress}
        width={gridCardWidth}
      />
    </View>
  );

  const renderSuggestionCard = ({ item }: { item: Product }) => (
    <View style={styles.suggestionCardWrapper}>
      <ProductCard
        product={item}
        onPress={() => setSelectedProduct(item)}
        onWishlistPress={handleWishlistPress}
        compact
        width={SUGGESTION_CARD_WIDTH}
      />
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.brandRow}>
        <Text style={[styles.brandText, { color: colors.textMuted }]}>
          AARUSH MP DREAMS (OPC) PRIVATE LIMITED
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.categoryTitle, { color: colors.text }]}>Categories</Text>
      </View>
      <FlatList
        horizontal
        data={sampleCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <View style={styles.suggestionHeader}>
        <Text style={[styles.suggestionTitle, { color: colors.text }]}>Today's Picks</Text>
      </View>
      <FlatList
        horizontal
        data={sampleProducts}
        renderItem={renderSuggestionCard}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionList}
      />
      <View style={styles.productHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Products</Text>
      </View>
    </>
  );

  const dynamicStyles = {
    safeArea: { backgroundColor: colors.background },
    searchRowBg: { backgroundColor: colors.background },
    searchInput: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      color: colors.text,
    },
    suggestionBox: {
      backgroundColor: colors.card,
      borderColor: colors.borderLight,
    },
    searchSuggestionText: { color: colors.text },
  };

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.container, styles.searchRow, dynamicStyles.searchRowBg, { paddingHorizontal: contentPadding }]}>
              <View style={[styles.logoWrap, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}>
                <Text style={styles.logo}>DM</Text>
              </View>
              <TextInput
                style={[styles.searchInput, dynamicStyles.searchInput]}
                placeholder="Search products..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={() => router.push('/tabs/cart')} style={styles.cartIconWrap}>
                <Ionicons name="cart-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <Animated.View style={[styles.flex1, { opacity: fadeAnim }]}>
            {search.length > 0 && (
              <ScrollView
                style={[styles.suggestionBox, dynamicStyles.suggestionBox, { left: contentPadding, right: contentPadding }]}
                keyboardShouldPersistTaps="handled"
              >
                {matchedProducts.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setSelectedProduct(item);
                      setSearch('');
                    }}
                    style={styles.searchSuggestionItem}
                  >
                    <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.searchSuggestionText, dynamicStyles.searchSuggestionText]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <FlatList
              data={sampleProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={productColumns}
              columnWrapperStyle={[styles.columnWrapper, { paddingHorizontal: contentPadding }]}
              contentContainerStyle={[styles.productList, { paddingBottom: 100 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={ListHeader}
            />

            {selectedProduct && (
              <ProductModal
                visible={!!selectedProduct}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    zIndex: 100,
    gap: 10,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    height: 42,
    fontSize: typography.fontSize.md,
  },
  cartIconWrap: {
    padding: spacing.xs,
  },
  suggestionBox: {
    position: 'absolute',
    top: 94,
    zIndex: 99,
    borderRadius: borderRadius.md,
    maxHeight: 220,
    ...shadows.lg,
    paddingVertical: spacing.xs,
  },
  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
  },
  brandRow: {
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  brandText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxs,
  },
  suggestionHeader: {
    marginTop: spacing.xl - 4,
    paddingHorizontal: spacing.xxs,
  },
  productHeader: {
    marginTop: spacing.xl - 4,
    paddingHorizontal: spacing.xxs,
  },
  categoryTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm + 2,
  },
  sectionTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.sm + 2,
  },
  categoryList: {
    paddingBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  suggestionList: {
    paddingHorizontal: spacing.xxs,
    paddingRight: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    minWidth: 72,
    ...shadows.sm,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  productWrapper: {
    marginBottom: spacing.md,
  },
  suggestionCardWrapper: {
    marginRight: spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productList: {},
});
