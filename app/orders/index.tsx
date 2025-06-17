import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const orders = [
  {
    id: 'OD12345678',
    product: 'Motovolt URBN Electric Bike | 105 Km Range (Pedal Assist)',
    date: 'Mar 11',
    image: 'http://147.93.58.23:6005/uploads/1749963178363-688820671.webp',
    status: 'Delivered',
  },
  // {
  //   id: 'OD87654321',
  //   product: 'realme C61 (Marble Black, 64 GB)',
  //   date: 'Dec 30, 2024',
  //   image: 'https://picsum.photos/100?2',
  //   status: 'Delivered',
  // },
];

export default function OrdersScreen() {
  const router = useRouter();

  return (
    
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Orders</Text>
        <Ionicons name="cart-outline" size={24} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search your order here"
      />

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deliveryText}>Delivered on {item.date}</Text>
              <Text style={styles.productName} numberOfLines={1}>{item.product}</Text>
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star-outline" size={16} color="#999" />
                ))}
              </View>
              <Text style={styles.rateText}>Rate this product now</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 28, },
  searchInput: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center',
    marginTop:8,
  },
  image: { width: 60, height: 60, borderRadius: 8 },
  deliveryText: { fontSize: 13, color: '#555' },
  productName: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', marginTop: 6 },
  rateText: { fontSize: 12, color: '#888', marginTop: 6 },
});
