import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ShippingPolicyModal = ({ visible, onClose }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalCard}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Shipping Policy</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>

            <Text style={styles.section}>
              Shipping Policy
            </Text>

            <Text style={styles.section}>
              This Shipping Policy explains how orders are processed, shipped, and delivered to customers across India.
            </Text>

            <Text style={styles.sectionTitle}>1. Our Shipping Partner</Text>
            <Text style={styles.bullet}>• All orders get shipped via India Post (Speed Post).</Text>
            <Text style={styles.bullet}>• This allows us to deliver to every serviceable pincode in India, including remote and rural areas.</Text>

            <Text style={styles.sectionTitle}>2. Order Processing Time</Text>
            <Text style={styles.bullet}>• Orders are typically processed, packed, and dispatched within 1 to 7 business days.</Text>
            <Text style={styles.bullet}>• Dispatch operations are carried out from Monday to Friday, excluding public holidays.</Text>

            <Text style={styles.sectionTitle}>3. Shipping Rates</Text>
            <Text style={styles.bullet}>• Shipping charges are not flat-rate.</Text>
            <Text style={styles.bullet}>• The final shipping cost is calculated at checkout based on the total weight and dimensions of the package, in accordance with India Post weight slabs.</Text>

            <Text style={styles.sectionTitle}>4. Estimated Delivery Timelines</Text>
            <Text style={styles.bullet}>• Most orders are delivered within 7 to 15 business days after dispatch.</Text>
            <Text style={styles.bullet}>• Delivery timelines may vary depending on your location and local India Post operations.</Text>

            <Text style={styles.sectionTitle}>5. Tracking Your Shipment (via WhatsApp)</Text>
            <Text style={styles.bullet}>• Once your order is handed over to India Post, we will share the Consignment Number and tracking link directly on your registered WhatsApp number.</Text>
            <Text style={styles.bullet}>• You can use this number to track your shipment on the India Post Consignment Tracking portal.</Text>

            <Text style={styles.sectionTitle}>6. Delivery Attempts</Text>
            <Text style={styles.bullet}>• If you are unavailable at the time of delivery, the postman may leave a delivery notice.</Text>
            <Text style={styles.bullet}>• The parcel may be held at your local post office for a limited time before being returned.</Text>

            <Text style={styles.sectionTitle}>7. Damages & Unboxing Video</Text>
            <Text style={styles.bullet}>
              • A clear, uncut unboxing video is required to support any claims for damage that may occur during the 7–15 day transit period.
            </Text>

          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ShippingPolicyModal;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 20,
    maxHeight: '85%',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: Colors.black,
  },
  section: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 6,
  },
  email: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
