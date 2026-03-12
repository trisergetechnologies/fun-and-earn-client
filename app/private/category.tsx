import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '@/components/CartContext';
import ProductModal from '@/components/ProductModal';
import { useTheme } from '@/components/ThemeContext';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

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

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async () => {
    setLoading(true);
    const url = `${process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1'}/ecart/user/product/products/slug/${slug}`;
    const token = await getToken();
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data);
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

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const filteredProducts =
    products?.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

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
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={48} color={colors.textMuted} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No products found</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={`Search in ${slug}`}
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

        {selectedProduct && (
          <ProductModal
            visible={!!selectedProduct}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  safeArea: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 40,
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
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
