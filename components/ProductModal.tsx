import React from 'react';
import { useCart } from '../components/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface ProductModalProps {
    visible: boolean;
    onClose: () => void;
    product: {
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
    } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
    const translateY = useSharedValue(height);
    const { addToCart } = useCart();

    React.useEffect(() => {
        translateY.value = withTiming(visible ? height * 0.1 : height, { duration: 300 });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!product) return null;

    return (
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <View style={styles.modalContent}>

                {/* Close button in top-right */}
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Text style={styles.closeIconText}>✕</Text>
                </TouchableOpacity>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />

                    <Text style={styles.productName}>{product.title}</Text>
                    <Text style={styles.productPrice}>₹{product.finalPrice}</Text>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => {
                                addToCart(product);
                                Alert.alert('Cart', `${product.title} added to cart`);
                                onClose();
                            }}
                        >
                            <Text style={styles.cartButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Animated.View>
    );
};

export default ProductModal;

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '90%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
        elevation: 10,
        zIndex: 100,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    closeIcon: {
        position: 'absolute',
        top: 14,
        right: 18,
        zIndex: 10,
        backgroundColor: '#fee2e2',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIconText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        resizeMode: 'contain',
        backgroundColor: '#f3f4f6',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#111827',
    },
    productPrice: {
        fontSize: 18,
        color: '#3b82f6',
        marginTop: 6,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 18,
        marginBottom: 4,
        color: '#111827',
    },
    productDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4b5563',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 24,
        justifyContent: 'center',
    },
    cartButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    cartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
    },
});
