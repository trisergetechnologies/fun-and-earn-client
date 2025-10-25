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

const ReturnRefundPolicyModal = ({ visible, onClose }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Return & Refund Policy</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
  <Text style={styles.section}>
    At <Text style={{ fontWeight: "600" }}>DreamMart</Text>, operated by{" "}
    <Text style={{ fontWeight: "600" }}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text>, 
    we value your trust and aim to provide the best shopping experience possible.  
    If for any reason you are not completely satisfied with your purchase, you may request a return within{" "}
    <Text style={{ fontWeight: "600", color: "#dc2626" }}>2 days of delivery</Text>.  
    This policy outlines the eligibility, process, and timeline for returns and refunds to ensure transparency 
    and convenience for our customers.
  </Text>

  <Text style={styles.sectionTitle}>1. Eligibility for Returns</Text>
  <Text style={styles.section}>
    To be eligible for a return, your item must meet the following conditions:
  </Text>
  <Text style={styles.bullet}>• The product must be unused, unwashed, and in the same condition that you received it.</Text>
  <Text style={styles.bullet}>• It must be in the original packaging with all tags and labels intact.</Text>
  <Text style={styles.bullet}>• Returns must be requested within 2 days from the date of delivery.</Text>
  <Text style={styles.bullet}>• Certain categories such as personal care, innerwear, and customized products are non-returnable.</Text>

  <Text style={styles.sectionTitle}>2. How to Request a Return?</Text>
  <Text style={styles.section}>
    To initiate a return, please send us an email at{" "}
    <Text style={styles.email}>ampdreammart@gmail.com</Text> with the following details:
  </Text>
  <Text style={styles.bullet}>• Subject Line: <Text style={{ fontWeight: "600" }}>"Return Request – [Your Order ID]"</Text></Text>
  <Text style={styles.bullet}>• Your full name and contact number.</Text>
  <Text style={styles.bullet}>• A brief explanation of the reason for your return.</Text>
  <Text style={styles.bullet}>• Clear photos of the product and packaging (if applicable).</Text>

  <Text style={styles.sectionTitle}>3. Review & Approval</Text>
  <Text style={styles.section}>
    Once we receive your request, our support team will review the details within 24–48 hours.  
    If approved, you will receive instructions for returning the product, including the return address.  
    Shipping charges for returns may be borne by the customer unless the return is due to our error.
  </Text>

  <Text style={styles.sectionTitle}>4. Refund Process</Text>
  <Text style={styles.section}>
    After your returned item is received and inspected, we will notify you via email. If approved:
  </Text>
  <Text style={styles.bullet}>• Refunds will be processed within 5–7 business days.</Text>
  <Text style={styles.bullet}>• The refund will be credited to your original payment method.</Text>
  <Text style={styles.bullet}>• For COD orders, you may be asked for bank details for refund transfer.</Text>

  <Text style={styles.sectionTitle}>5. Exchange Policy</Text>
  <Text style={styles.section}>
    Currently, we do not support direct exchanges. To replace an item, please return the unwanted one 
    and place a new order.
  </Text>

  <Text style={styles.sectionTitle}>6. Non-Returnable Items</Text>
  <Text style={styles.section}>
    The following items cannot be returned due to hygiene or customization reasons:
  </Text>
  <Text style={styles.bullet}>• Innerwear, lingerie, and personal hygiene items.</Text>
  <Text style={styles.bullet}>• Customized or personalized products.</Text>
  <Text style={styles.bullet}>• Gift cards or digital downloads.</Text>
  <Text style={styles.bullet}>• Items marked as "Final Sale".</Text>

  <Text style={styles.sectionTitle}>7. Damaged or Defective Items</Text>
  <Text style={styles.section}>
    If you receive a damaged or defective item, please report it within{" "}
    <Text style={{ fontWeight: "600" }}>24 hours of delivery</Text> with photo/video proof.  
    Our team will verify the issue and arrange for a replacement or refund at no extra cost.
  </Text>

  <Text style={styles.sectionTitle}>8. Contact Us</Text>
  <Text style={styles.section}>
    For any questions or refund-related queries, please contact us at{" "}
    <Text style={styles.email}>ampdreammart@gmail.com</Text>.{"\n\n"}
    This Return & Refund Policy is issued by{" "}
    <Text style={{ fontWeight: "600" }}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text>, 
    the company that owns and operates <Text style={{ fontWeight: "600" }}>DreamMart</Text>.
  </Text>
</ScrollView>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ReturnRefundPolicyModal;

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
