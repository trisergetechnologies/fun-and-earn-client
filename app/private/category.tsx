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
  View
} from 'react-native';

import { useCart } from '@/components/CartContext'; // ✅ Important: import CartContext
import ProductModal from '@/components/ProductModal';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
const { width } = Dimensions.get('window');
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

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


export default function CategoryScreen() {

  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; // ✅ FADE-IN animation
  const [loading, setLoading] = useState<boolean>(false);


    const fetchProducts = async () => {
    setLoading(true);
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/product/products/slug/${slug}`;
    const token = await getToken();

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(response.data.data);

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


  // const renderProduct = ({ item }) => (
  //   <TouchableOpacity style={styles.productWrapper} onPress={() => setSelectedProduct(item)}>
  //     <View style={styles.productCard}>
  //       <Image source={{ uri: item.image[0] }} style={styles.productImage} />
  //       <View style={styles.cardDetails}>
  //         <Text style={styles.productPrice}> ₹{item.price}</Text>
  //         <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );

    const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => setSelectedProduct(item)} style={styles.productWrapper}>
      <View style={styles.productCard}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        <View style={styles.cardDetails}>
          <Text style={styles.productPrice}> ₹{item.finalPrice}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
      useEffect(() => {
          fetchProducts()
      }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search in ${slug}`}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 300 }}>No products found</Text>}
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
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 39,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#fff',
    fontSize: 14,
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
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: width * 0.38,
    resizeMode: 'contain'
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
});
