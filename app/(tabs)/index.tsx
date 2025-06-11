import { useAuth } from '@/components/AuthContext';
import ProductModal from '@/components/ProductModal'; // ✅ Modal component
import { Colors } from '@/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
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
  View
} from 'react-native';


const { width } = Dimensions.get('window');

const sampleCategories = [
  { id: 1, name: 'Clothes', icon: 'https://picsum.photos/40?1' },
  { id: 2, name: 'Electronics', icon: 'https://picsum.photos/40?2' },
  { id: 3, name: 'Furniture', icon: 'https://picsum.photos/40?3' },
  { id: 4, name: 'Shoes', icon: 'https://picsum.photos/40?4' },
  
   { id: 5, name: 'Electronics', icon: 'https://picsum.photos/40?2' },
  { id: 6, name: 'Furniture', icon: 'https://picsum.photos/40?3' },
  { id: 7, name: 'Shoes', icon: 'https://picsum.photos/40?4' },
  { id: 8, name: 'Jewellery', icon: 'https://picsum.photos/40?5' },

];

const sampleProducts = [
  {
    id: 101,
    name: 'Mid-Century Modern Wooden Dining Table',
    price: 24,
    rating: 4.7,
    image: 'https://picsum.photos/200?random=1',
    category: 'Furniture',
  },
  {
    id: 102,
    name: 'Elegant Golden-Base Stone Top Dining Table',
    price: 66,
    rating: 4.7,
    image: 'https://picsum.photos/200?random=2',
    category: 'Furniture',
  },
  {
    id: 103,
    name: 'Modern Minimalist Chair',
    price: 39,
    rating: 4.5,
    image: 'https://picsum.photos/200?random=3',
    category: 'Furniture',
  },
  {
    id: 104,
    name: 'Stylish Office Desk Lamp',
    price: 19,
    rating: 4.2,
    image: 'https://picsum.photos/200?random=4',
    category: 'Electronics',
  },
  {
    id: 105,
    name: 'Classic White Sneakers',
    price: 49,
    rating: 4.4,
    image: 'https://picsum.photos/200?random=5',
    category: 'Shoes',
  },
  {
    id: 106,
    name: 'Casual Round Neck T-Shirt',
    price: 25,
    rating: 4.3,
    image: 'https://picsum.photos/200?random=6',
    category: 'Clothes',
  },
  {
    id: 107,
    name: 'Gold Plated Necklace',
    price: 99,
    rating: 4.8,
    image: 'https://picsum.photos/200?random=7',
    category: 'Jewellery',
  },
];


const ExploreScreen = () => {

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // ✅ Modal state
  const { user } = useAuth();
  console.log('user from home screen',user);

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => router.push(`/category?name=${item.name}`)}>

      <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedProduct(item)} style={styles.productWrapper}>
      <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity style={styles.favoriteIcon}>
          <Ionicons name="heart-outline" size={18} color="gray" />
        </TouchableOpacity>
        <View style={styles.cardDetails}>
          <Text style={styles.productPrice}> ₹{item.price}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={12} color="#f1c40f" />
            <Text style={styles.productRating}>{item.rating}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  const renderSuggestionCard = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedProduct(item)} style={styles.suggestionCardWrapper}>
      <View style={styles.suggestionCard}>
        <Image source={{ uri: item.image }} style={styles.suggestionImage} />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.suggestionPrice}>₹{item.price}</Text>
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
        data={sampleProducts.slice(0, 7)}
        renderItem={renderSuggestionCard}
        keyExtractor={(item) => item.id.toString() + 'sugg'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />

      <View style={styles.productHeader}>
        <Text style={styles.sectionTitle}>Explore Our Products</Text>
      </View>
    </>
  );


  const matchedProducts = sampleProducts.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 }}>
          <View style={[styles.container, styles.searchRow]}>
            <Text style={styles.logo}>F&E</Text>
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
              onPress={() => router.push('/cart')}
            />
          </View>
          

          {search.length > 0 && (
            <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled">
              {matchedProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedProduct(item); // ✅ Show in modal
                    setSearch('');
                  }}
                >
                  <Text style={{ paddingVertical: 8, fontSize: 14 }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={sampleProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeader}
          />



          {/* ✅ Product Modal */}
          {selectedProduct && (
            <ProductModal
              visible={!!selectedProduct}
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </View>
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
    resizeMode: 'cover',
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
    resizeMode: 'cover',
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