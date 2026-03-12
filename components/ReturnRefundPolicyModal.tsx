import { useTheme } from '@/components/ThemeContext';
import { PolicyModal, policyTextStyles } from '@/components/ui/PolicyModal';
import { Text } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ReturnRefundPolicyModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const s = policyTextStyles;
  return (
    <PolicyModal visible={visible} onClose={onClose} title="Refund & Cancellation Policy">
      <Text style={[s.section, { color: colors.textSecondary }]}>
        At DreamMart, owned and operated by AARUSH MP DREAMS (OPC) PRIVATE LIMITED, we value your trust and aim to provide the best shopping experience possible.
        If for any reason you are not completely satisfied with your purchase, you may request a return within{' '}
        <Text style={[s.bold, { color: colors.error }]}>2 days of delivery</Text>.
        This policy outlines the eligibility, process, and timeline for returns and refunds to ensure transparency and convenience for our customers.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>1. Eligibility for Returns</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>To be eligible for a return, your item must meet the following conditions:</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• The product must be unused, unwashed, and in the same condition that you received it.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• It must be in the original packaging with all tags and labels intact.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Returns must be requested within 2 days from the date of delivery.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Certain categories such as personal care, innerwear, and customized products are non-returnable.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>2. How to Request a Return?</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        To initiate a return, please send us an email at{' '}
        <Text style={[s.email, { color: colors.primary }]}>ampdreammart@gmail.com</Text> with the following details:
      </Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Subject Line: <Text style={[s.bold, { color: colors.text }]}>"Return Request – [Your Order ID]"</Text></Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Your full name and contact number.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• A brief explanation of the reason for your return (e.g., wrong size, damaged item, defective product).</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Clear photos of the product and packaging (if applicable) to speed up the review process.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>3. Review & Approval</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        Once we receive your request, our support team at AARUSH MP DREAMS (OPC) PRIVATE LIMITED will review the details within 24–48 hours.
        If approved, you will receive instructions for returning the product, including the return address and packaging guidelines.
        Please note that shipping charges for returns may be borne by the customer unless the return is due to a mistake on our part.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>4. Refund Process</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        After your returned item is received and inspected, we will notify you via email. If the return is approved:
      </Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Refunds will be processed within 5–7 business days.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• The refund will be credited to your original payment method (UPI, card, wallet, etc.).</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• In case of COD orders, you may be asked to provide bank account details for the refund transfer.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>5. Contact Us</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        If you have any questions regarding our Return & Refund Policy, please reach out to our customer support team at{' '}
        <Text style={[s.email, { color: colors.primary }]}>ampdreammart@gmail.com</Text>.
        We are here to assist you and ensure a smooth and hassle-free shopping experience.{'\n\n'}
        AARUSH MP DREAMS (OPC) PRIVATE LIMITED{'\n'}
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Cancellation Policy</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>Timing:</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        Orders can usually be canceled before the <Text style={[s.bold, { color: colors.text }]}>"Out for Delivery" or "Shipped"</Text> status, often within a few minutes to hours of placing the order.{'\n\n'}
        AARUSH MP DREAMS (OPC) PRIVATE LIMITED{'\n'}
      </Text>
    </PolicyModal>
  );
};

export default ReturnRefundPolicyModal;
