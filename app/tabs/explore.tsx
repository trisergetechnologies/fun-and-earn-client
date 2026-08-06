import { useAuth } from '@/components/AuthContext';
import { useCart } from '@/components/CartContext';
import ProductModal from '@/components/ProductModal';
import SimpleSpinner from '@/components/SimpleSpinner';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { EmptyState, Input, ProductCard, ProductGridSkeleton } from '@/components/ui';
import { ActivationExclusiveSection } from '@/components/ui/ActivationExclusiveSection';
import { getToken } from '@/helpers/authStorage';
import { spacing, borderRadius, typography, shadows } from '@/constants/DesignSystem';
import { useResponsive } from '@/hooks/useResponsive';
import { ExploreCategory, Product } from '@/types/product';
import { formatDreamCash } from '@/utils/walletFormat';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const CARD_GAP = 12;
const SUGGESTION_CARD_WIDTH = 156;
const CATEGORY_ITEM_WIDTH = 84;

const ExploreScreen = () => {
  const { colors } = useTheme();
  const { contentPadding, productColumns, width: screenWidth } = useResponsive();
  const { isAuthLoading } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasLoadedRef = useRef(false);
  const [sampleCategories, setSampleCategories] = useState<ExploreCategory[]>([]);

  const gridCardWidth =
    (screenWidth - 2 * contentPadding - (productColumns - 1) * CARD_GAP) / productColumns;

  const matchedProducts = useMemo(
    () =>
      sampleProducts.filter((item) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [sampleProducts, search]
  );

  const activationExclusive = useMemo(() => {
    const specials = sampleProducts.filter((item) => item.isSpecial === true);
    const shuffled = [...specials];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }, [sampleProducts]);

  const todaysPicks = useMemo(
    () => sampleProducts.filter((item) => item.isSpecial !== true).slice(0, 8),
    [sampleProducts]
  );

  const loadExploreData = useCallback(async (isRefresh = false) => {
    if (!isRefresh && !hasLoadedRef.current) {
      setInitialLoading(true);
    }

    const token = await getToken();
    if (!token) {
      setInitialLoading(false);
      return;
    }

    const productsUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/product/products`;
    const categoriesUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/categories`;

    const [productsResponse, categoriesResponse] = await Promise.all([
      axios.get(productsUrl, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(categoriesUrl, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (productsResponse.data?.success && Array.isArray(productsResponse.data.data)) {
      setSampleProducts(productsResponse.data.data);
    } else {
      setSampleProducts([]);
    }

    if (categoriesResponse.data?.success && Array.isArray(categoriesResponse.data.data)) {
      setSampleCategories(
        categoriesResponse.data.data.map(
          (item: { _id: string; title: string; slug: string; ownerId?: string }) => ({
            id: item._id,
            name: item.title,
            slug: item.slug,
            ownerId: item.ownerId || 'unknown',
          })
        )
      );
    } else {
      setSampleCategories([]);
    }

    if (!hasLoadedRef.current) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
      hasLoadedRef.current = true;
    }
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      loadExploreData(hasLoadedRef.current).catch(() => {
        if (!hasLoadedRef.current) {
          Toast.show({ type: 'error', text1: 'Could not load products', text2: 'Please try again.' });
        }
      }).finally(() => {
        setInitialLoading(false);
      });
    }, [loadExploreData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExploreData(true);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleWishlistPress = () => {
    Toast.show({ type: 'info', text1: 'Wishlist', text2: 'Coming soon!', position: 'bottom' });
  };

  const handleProductPress = useCallback((item: Product) => {
    setSelectedProduct(item);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  if (isAuthLoading) return <SimpleSpinner />;

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productWrapper, { width: gridCardWidth, maxWidth: gridCardWidth }]}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        onWishlistPress={handleWishlistPress}
        width={gridCardWidth}
      />
    </View>
  );

  const ListHeader = () => (
    <>
      <Text style={[styles.sectionLabel, { color: colors.textMuted, paddingHorizontal: contentPadding }]}>
        CATEGORIES
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={[styles.categoryList, { paddingHorizontal: contentPadding }]}
      >
        {sampleCategories.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push(
                `/private/category?slug=${encodeURIComponent(item.slug)}&name=${encodeURIComponent(item.name)}`
              )
            }
            style={({ pressed }) => [
              styles.categoryItem,
              {
                width: CATEGORY_ITEM_WIDTH,
                opacity: pressed ? 0.75 : 1,
                marginRight: index < sampleCategories.length - 1 ? spacing.sm : 0,
              },
            ]}
          >
            <View style={[styles.categoryIconWrap, { backgroundColor: colors.primaryTint }]}>
              <Text style={[styles.categoryLetter, { color: colors.primary }]}>
                {(item.name?.trim()?.charAt(0) || '?').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.categoryText, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text
        style={[
          styles.discoverLine,
          { color: colors.textMuted, paddingHorizontal: contentPadding },
        ]}
      >
        Discover products & deals
      </Text>

      <ActivationExclusiveSection
        products={activationExclusive}
        contentPadding={contentPadding}
        onProductPress={handleProductPress}
      />

      {todaysPicks.length > 0 ? (
        <>
          <Text
            style={[
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              { color: colors.textMuted, paddingHorizontal: contentPadding },
            ]}
          >
            TODAY&apos;S PICKS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={[styles.suggestionList, { paddingHorizontal: contentPadding }]}
          >
            {todaysPicks.map((item) => (
              <View key={item._id} style={styles.suggestionCardWrapper}>
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item)}
                  onWishlistPress={handleWishlistPress}
                  compact
                  width={SUGGESTION_CARD_WIDTH}
                />
              </View>
            ))}
          </ScrollView>
        </>
      ) : null}

      <Text
        style={[
          styles.sectionLabel,
          styles.sectionLabelSpaced,
          { color: colors.textMuted, paddingHorizontal: contentPadding },
        ]}
      >
        ALL PRODUCTS
      </Text>
    </>
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[styles.flex1, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.topBar, { paddingHorizontal: contentPadding, backgroundColor: colors.background }]}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logo, { color: colors.primaryContrast }]}>DM</Text>
          </View>
          <View style={styles.searchWrap}>
            <Input
              leftIcon="search-outline"
              placeholder="Search products..."
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          <Pressable
            onPress={() => router.push('/tabs/cart')}
            style={({ pressed }) => [styles.cartIconWrap, { opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {cartCount > 0 ? (
              <View style={[styles.cartBadge, { backgroundColor: colors.error }]}>
                <Text style={[styles.cartBadgeText, { color: colors.primaryContrast }]}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {search.length > 0 ? (
          <View
            style={[
              styles.suggestionBox,
              {
                left: contentPadding,
                right: contentPadding,
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {matchedProducts.length === 0 ? (
              <Text style={[styles.searchEmpty, { color: colors.textMuted }]}>
                No products found for &quot;{search.trim()}&quot;
              </Text>
            ) : (
              matchedProducts.slice(0, 6).map((item) => (
                <Pressable
                  key={item._id}
                  onPress={() => {
                    handleProductPress(item);
                    setSearch('');
                  }}
                  style={({ pressed }) => [
                    styles.searchSuggestionItem,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <View style={[styles.searchThumb, { backgroundColor: colors.backgroundSecondary }]}>
                    {item.images?.[0] ? (
                      <Image source={{ uri: item.images[0] }} style={styles.searchThumbImage} />
                    ) : (
                      <Ionicons name="image-outline" size={16} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.searchSuggestionTextWrap}>
                    <Text
                      numberOfLines={1}
                      style={[styles.searchSuggestionTitle, { color: colors.text }]}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.searchSuggestionPrice, { color: colors.primary }]}>
                      {formatDreamCash(item.finalPrice)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {initialLoading ? (
          <View style={styles.flex1}>
            <ActivationExclusiveSection
              products={[]}
              contentPadding={contentPadding}
              onProductPress={handleProductPress}
              loading
            />
            <ProductGridSkeleton />
          </View>
        ) : (
          <Animated.View style={[styles.flex1, { opacity: fadeAnim }]}>
            <FlatList
              data={sampleProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={productColumns}
              columnWrapperStyle={
                productColumns > 1
                  ? [styles.columnWrapper, { paddingHorizontal: contentPadding, gap: CARD_GAP }]
                  : { paddingHorizontal: contentPadding }
              }
              contentContainerStyle={[styles.productList, { paddingBottom: 100 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={ListHeader}
              ListEmptyComponent={
                <EmptyState
                  icon="cube-outline"
                  title="No products yet"
                  subtitle="Check back soon for new items."
                  style={styles.emptyState}
                />
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
            />
          </Animated.View>
        )}

        <ProductModal
          visible={selectedProduct !== null}
          product={selectedProduct}
          onClose={handleModalClose}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.5,
  },
  searchWrap: {
    flex: 1,
  },
  cartIconWrap: {
    padding: spacing.xs,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  suggestionBox: {
    position: 'absolute',
    top: 58,
    zIndex: 99,
    borderRadius: borderRadius.lg,
    maxHeight: 280,
    borderWidth: 1,
    ...shadows.lg,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  searchEmpty: {
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchThumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  searchSuggestionTextWrap: {
    flex: 1,
  },
  searchSuggestionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  searchSuggestionPrice: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  sectionLabelSpaced: {
    marginTop: spacing.lg,
  },
  discoverLine: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryList: {
    paddingBottom: spacing.sm,
  },
  suggestionList: {
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: spacing.xxs,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLetter: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 20,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  productWrapper: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  suggestionCardWrapper: {
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  columnWrapper: {
    alignItems: 'flex-start',
  },
  productList: {
    flexGrow: 1,
    paddingTop: spacing.xs,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
});
