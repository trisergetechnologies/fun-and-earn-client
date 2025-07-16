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

const TermsAndConditionsModal = ({ visible, onClose }: Props) => {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <SafeAreaView style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Terms and Conditions</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.black} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.sectionTitle}>1. Maintenance Charges</Text>
                        <Text style={styles.section}>
                            The maintenance charges are for maintenance of the application hosted on our servers, including periodic updates.
                        </Text>

                        <Text style={styles.sectionTitle}>2. Configuration Responsibility</Text>
                        <Text style={styles.section}>
                            The Company will guide the Client and provide all possible training and training material for the platform configuration. However, the Company is not responsible for configuring the platform. The Client is required to complete the configuration independently.
                        </Text>

                        <Text style={styles.sectionTitle}>3. No Response Situation</Text>
                        <Text style={styles.section}>
                            If the Client fails to respond for more than 7 days despite reminders, the Company may put the development on hold. If there is no response for more than 14 days, the Company may terminate the contract.
                        </Text>

                        <Text style={styles.sectionTitle}>4. Payment Terms</Text>
                        <Text style={styles.bullet}>• Refund Policy: Refer here.</Text>
                        <Text style={styles.bullet}>• 18% GST is included in the above-mentioned cost.</Text>

                        <Text style={styles.sectionTitle}>5. Renewal on Plan Expiry</Text>
                        <Text style={styles.section}>
                            Upon plan expiry, the standard cost will apply as per the Client's selected plan from the available options at that time.
                        </Text>

                        <Text style={styles.sectionTitle}>6. Timeline</Text>
                        <Text style={styles.section}>
                            The solution will be delivered within 15–20 working days.
                        </Text>

                        <Text style={styles.sectionTitle}>7. Important Note</Text>
                        <Text style={styles.section}>
                            The timeline will be applicable from the project kick-off date and only after the Client shares all the required information and assets.
                        </Text>

                        <Text style={styles.sectionTitle}>Contact Us</Text>
                        <Text style={styles.section}>
                            If you have any questions regarding these terms, please contact us at <Text style={styles.email}>info@aarushmp.com</Text>.
                        </Text>
                    </ScrollView>

                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default TermsAndConditionsModal;

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
