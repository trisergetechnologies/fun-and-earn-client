import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const OrderDetails = () => {
  const {id} = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order ID - {id}</Text>

      <View style={styles.row}>
        <Image source={{ uri: 'http://147.93.58.23:6005/uploads/1749963178363-688820671.webp' }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>Motovolt URBN Electric Bike | 105 Km Range (Pedal Assist)</Text>
          <Text style={styles.price}>₹42299.1</Text>
          <Text style={styles.seller}>Seller: GRAHGOODS BIKE</Text>
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
<Text>List Price: ₹45,999.00</Text>
<Text>Selling Price: ₹42,299.10</Text>
<Text>Discount: -₹3,699.90</Text>
<Text>GST (18%): ₹7,613.84</Text>
<Text>Shipping Charge: ₹299.00</Text>
<Text>Secure Packaging: ₹59.00</Text>
<Text>COD Charge: ₹49.00</Text>
<Text>Extended Warranty: ₹2,499.00</Text>
<Text>Installation Fee: ₹999.00</Text>
<Text>Insurance: ₹1,499.00</Text>
<Text>Gift Wrap: ₹99.00</Text>
<Text>Special Offer Discount: -₹500.00</Text>
<Text style={styles.total}>Total: ₹54,216.98</Text>
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
