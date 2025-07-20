import { useAuth } from '@/components/AuthContext';
import ProductModal from '@/components/ProductModal';
import SimpleSpinner from '@/components/SimpleSpinner';
import { Colors } from '@/constants/Colors';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
// import Constants from 'expo-constants';


import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

// const { EXPO_PUBLIC_BASE_URL } = Constants.expoConfig?.extra || {};
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const { width } = Dimensions.get('window');

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
};

const ExploreScreen = () => {

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

      // ✅ Start fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700, // smoother than 500ms
        easing: Easing.inOut(Easing.ease), // ease-in-out effect
        useNativeDriver: true,
      }).start()
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/categories`; // ✅ Corrected route
    const token = await getToken();

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedCategories = response.data.data.map((item: any) => ({
        id: item._id,
        name: item.title,
        slug: item.slug,
        image: 'https://via.placeholder.com/150', // fallback since schema has no image
        ownerId: item.ownerId || 'unknown',
      }));

      setSampleCategories(formattedCategories); // ✅ Setting category state
      console.log("sample categories", formattedCategories)

      // Optional: start animation if needed
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

  useEffect(() => {
      fetchCategories();
      fetchProducts();
  }, []);

  if(isAuthLoading) return <SimpleSpinner/>


  const renderCategory = ({ item }: {item:any}) => {
    const iconUri = item.icon?.trim()
      ? item.icon
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name.charAt(0))}&background=3b82f6&color=fff&size=128&font-size=0.5`;

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
         
          router.push(`/private/category?slug=${item.slug}`)
        }}
      >
        <Image source={{ uri: iconUri }} style={styles.categoryIcon} />
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };


  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => setSelectedProduct(item)} style={styles.productWrapper}>
      <View style={styles.productCard}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        <TouchableOpacity style={styles.favoriteIcon}>
          <Ionicons name="heart-outline" size={18} color="gray" />
        </TouchableOpacity>
        <View style={styles.cardDetails}>
          <Text style={styles.productPrice}> ₹{item.finalPrice}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionCard = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => setSelectedProduct(item)} style={styles.suggestionCardWrapper}>
      <View style={styles.suggestionCard}>
        <Image source={{ uri: item.images[0] }} style={styles.suggestionImage} />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.suggestionPrice}>₹{item.finalPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.categoryTitle}>Categories</Text>
      </View>
      <FlatList
        horizontal
        data={sampleCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionTitle}>Today's Suggestions</Text>
      </View>
      <FlatList
        horizontal
        data={sampleProducts}
        renderItem={renderSuggestionCard}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />
      <View style={styles.productHeader}>
        <Text style={styles.sectionTitle}>Explore Our Products</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ✅ Wrap full content in fade-in animation */}
        {loading ? <SimpleSpinner /> :
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <View style={[styles.container, styles.searchRow]}>
              <Text style={styles.logo}>D M</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
              />
              <Ionicons
                style={styles.cartIcon}
                name="cart-outline"
                size={30}
                color={Colors.gray}
                onPress={() => router.push('/tabs/cart')}
              />
            </View>

            {search.length > 0 && (
              <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled">
                {matchedProducts.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setSelectedProduct(item);
                      setSearch('');
                    }}
                  >
                    <Text style={{ paddingVertical: 8, fontSize: 14 }}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <FlatList
              data={sampleProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
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
          </Animated.View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ExploreScreen;



const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#f6f6f6',

  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    zIndex: 100,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#2563eb',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    backgroundColor: '#fff',
    fontSize: 14,
    marginRight: 12,
  },
  cartIcon: {
    paddingTop: 2,
  },
  suggestionBox: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    zIndex: 99,
    borderRadius: 10,
    maxHeight: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  suggestionHeader: {
    marginTop: 30,
    paddingHorizontal: 4,
  },
  productHeader: {
    marginTop: 30,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    color: '#111',
  },
  suggestionTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 15,
    color: '#111',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 15,
    color: '#111',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 14,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
    backgroundColor: '#e5e5e5',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productWrapper: {
    flex: 0.5,
    padding: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.4,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: width * 0.38,
    resizeMode: 'contain',
  },
  cardDetails: {
    padding: 10,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#2563eb',
    fontSize: 14,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productRating: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  suggestionCardWrapper: {
    marginRight: 12,
  },
  suggestionCard: {
    width: 140,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
  },
  suggestionInfo: {
    padding: 8,
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 4,
  },
});