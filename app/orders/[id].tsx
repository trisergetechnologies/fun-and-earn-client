import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const OrderDetails = () => {
  const {id} = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order ID - {id}</Text>

      <View style={styles.row}>
        <Image source={{ uri: 'https://picsum.photos/120?random' }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>Motorola Edge 50 Fusion (Forest Green, 256 GB)</Text>
          <Text style={styles.price}>₹13,707</Text>
          <Text style={styles.seller}>Seller: GRAHGOODS RETAIL</Text>
        </View>
      </View>

      <View style={styles.statusBox}>
        <Text>✔ Order Confirmed, Mar 10</Text>
        <Text>✔ Delivered, Mar 11</Text>
      </View>

      <Text style={styles.subTitle}>Shipping Details</Text>
      <View style={styles.detailBox}>
        <Text>Priyanka Mishra</Text>
        <Text>D-67, Gali no 4, Vinod Nagar West, Delhi - 110092</Text>
        <Text>Phone: 9810658228</Text>
      </View>

      <Text style={styles.subTitle}>Price Details</Text>
      <View style={styles.detailBox}>
        <Text>List Price: ₹27,999</Text>
        <Text>Selling Price: ₹24,999</Text>
        <Text>Discount: -₹2,000</Text>
        <Text>Special Price: ₹22,999</Text>
        <Text>Delivery Charge: ₹40 Free</Text>
        <Text>Secure Pack: ₹59</Text>
        <Text>Exchange: -₹9,550</Text>
        <Text>Pickup Charge: ₹199</Text>
        <Text style={styles.total}>Total: ₹13,707</Text>
      </View>
    </ScrollView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  header: { fontSize: 16, fontWeight: 'bold', marginTop:28 },
  row: { flexDirection: 'row', marginTop:25, },
  image: { width: 80, height: 80, borderRadius: 6, marginRight: 12 ,},
  productName: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  price: { fontSize: 16, color: '#3b82f6', fontWeight: 'bold' },
  seller: { fontSize: 12, color: '#555' },
  statusBox: { backgroundColor: '#f6f6f6', padding: 12, borderRadius: 8, marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
  detailBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  total: { fontWeight: 'bold', marginTop: 8 },
});
