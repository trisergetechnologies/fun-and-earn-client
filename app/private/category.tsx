import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductModal from '@/components/ProductModal';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { EmptyState } from '@/components/ui';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 16 * 2 - CARD_GAP) / 2;

const EXPO_PUBLIC_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

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

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { slug: slugParam, name: nameParam } = useLocalSearchParams<{
    slug: string;
    name?: string;
  }>();
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const categoryNameRaw = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  const categoryName =
    categoryNameRaw && categoryNameRaw.trim().length > 0
      ? categoryNameRaw.trim()
      : slug
        ? slug.replace(/-/g, ' ')
        : 'Category';
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchProducts = async () => {
    if (!slug) {
      setProducts([]);
      return;
    }

    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/product/products/slug/${slug}`;
    const token = await getToken();
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fadeAnim.setValue(0);
    fetchProducts();
  }, [slug]);

  const filteredProducts =
    products?.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())) ?? [];

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

  const ListEmpty = () => (
    <EmptyState
      icon="search-outline"
      title="No products found"
      subtitle={`No products in ${categoryName} match your search.`}
    />
  );

  return (
    <Screen>
      <View style={styles.headerBlock}>
        <Text style={[styles.categoryHeading, { color: colors.textMuted }]} numberOfLines={2}>
          {categoryName}
        </Text>
        <Text style={[styles.categorySubheading, { color: colors.textSecondary }]}>
          Products in this category
        </Text>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={`Search in ${categoryName}`}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Animated.View style={[styles.flex1, { opacity: fadeAnim }]}>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <ProductModal
        visible={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  headerBlock: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoryHeading: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  categorySubheading: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '400',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
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
  cardDetails: { padding: 12 },
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: { paddingBottom: 24 },
});
