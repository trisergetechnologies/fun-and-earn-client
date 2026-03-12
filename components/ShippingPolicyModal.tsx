import { useTheme } from '@/components/ThemeContext';
import { PolicyModal, policyTextStyles } from '@/components/ui/PolicyModal';
import { Text } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ShippingPolicyModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const s = policyTextStyles;
  return (
    <PolicyModal visible={visible} onClose={onClose} title="Shipping Policy">
      <Text style={[s.section, { color: colors.textSecondary }]}>Shipping Policy</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        This Shipping Policy explains how orders are processed, shipped, and delivered to customers across India.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>1. Our Shipping Partner</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• All orders get shipped via India Post (Speed Post).</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• This allows us to deliver to every serviceable pincode in India, including remote and rural areas.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>2. Order Processing Time</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Orders are typically processed, packed, and dispatched within 1 to 7 business days.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Dispatch operations are carried out from Monday to Friday, excluding public holidays.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>3. Shipping Rates</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Shipping charges are not flat-rate.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• The final shipping cost is calculated at checkout based on the total weight and dimensions of the package, in accordance with India Post weight slabs.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>4. Estimated Delivery Timelines</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Most orders are delivered within 7 to 15 business days after dispatch.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Delivery timelines may vary depending on your location and local India Post operations.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>5. Tracking Your Shipment (via WhatsApp)</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Once your order is handed over to India Post, we will share the Consignment Number and tracking link directly on your registered WhatsApp number.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• You can use this number to track your shipment on the India Post Consignment Tracking portal.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>6. Delivery Attempts</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• If you are unavailable at the time of delivery, the postman may leave a delivery notice.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• The parcel may be held at your local post office for a limited time before being returned.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>7. Damages & Unboxing Video</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>
        • A clear, uncut unboxing video is required to support any claims for damage that may occur during the 7–15 day transit period.
      </Text>
    </PolicyModal>
  );
};

export default ShippingPolicyModal;
