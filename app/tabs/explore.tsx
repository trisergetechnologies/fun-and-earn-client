import { useAuth } from '@/components/AuthContext';
import ProductModal from '@/components/ProductModal';
import SimpleSpinner from '@/components/SimpleSpinner';
import { useTheme } from '@/components/ThemeContext';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 16 * 2 - CARD_GAP) / 2;

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
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [sampleCategories, setSampleCategories] = useState(null);

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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => setSelectedProduct(item)}
      style={styles.productWrapper}
      activeOpacity={0.9}
    >
      <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.productImageWrap}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
          {item.discountPercent > 0 && (
            <View style={[styles.discountTag, { backgroundColor: colors.discount }]}>
              <Text style={styles.discountTagText}>{item.discountPercent}% OFF</Text>
            </View>
          )}
        </View>
        <View style={styles.cardDetails}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.productPrice, { color: colors.primary }]}>₹{item.finalPrice}</Text>
            {item.discountPercent > 0 && (
              <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₹{item.price}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => setSelectedProduct(item)}
      style={styles.suggestionCardWrapper}
      activeOpacity={0.9}
    >
      <View style={[styles.suggestionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.suggestionImageWrap}>
          <Image source={{ uri: item.images[0] }} style={styles.suggestionImage} />
        </View>
        <View style={styles.suggestionInfo}>
          <Text style={[styles.suggestionName, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.suggestionPriceRow}>
            <Text style={[styles.suggestionPrice, { color: colors.primary }]}>₹{item.finalPrice}</Text>
            {item.discountPercent > 0 && (
              <Text style={[styles.suggestionOriginalPrice, { color: colors.textMuted }]}>₹{item.price}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        {loading ? (
          <SimpleSpinner />
        ) : (
          <Animated.View style={[styles.flex1, { opacity: fadeAnim }]}>
            <View style={[styles.container, styles.searchRow, dynamicStyles.searchRowBg]}>
              <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
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

            {search.length > 0 && (
              <ScrollView
                style={[styles.suggestionBox, dynamicStyles.suggestionBox]}
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
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.productList}
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
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 15,
  },
  cartIconWrap: {
    padding: 8,
  },
  suggestionBox: {
    position: 'absolute',
    top: 94,
    left: 16,
    right: 16,
    zIndex: 99,
    borderRadius: 12,
    maxHeight: 220,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    paddingVertical: 8,
  },
  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  brandRow: {
    marginVertical: 12,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  suggestionHeader: {
    marginTop: 28,
    paddingHorizontal: 4,
  },
  productHeader: {
    marginTop: 28,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 14,
  },
  categoryList: {
    paddingBottom: 12,
    paddingRight: 16,
  },
  suggestionList: {
    paddingHorizontal: 4,
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    marginBottom: 14,
  },
  productCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  productImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.9,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetails: {
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 15,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  suggestionCardWrapper: {
    marginRight: 14,
  },
  suggestionCard: {
    width: 148,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionImageWrap: {
    width: '100%',
    height: 120,
    backgroundColor: 'transparent',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  suggestionInfo: {
    padding: 10,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionOriginalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productList: {
    paddingBottom: 100,
  },
});
