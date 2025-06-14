import React from 'react';
import { useCart } from '../components/CartContext';

import { FontAwesome } from '@expo/vector-icons';
import {
    Alert,
    Dimensions,
    Image,
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
        id: number;
        name: string;
        price: number;
        rating: number;
        image: string;
        
    } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
    const translateY = useSharedValue(height);
    const { addToCart } = useCart(); // ✅ Access addToCart from context


    React.useEffect(() => {
        translateY.value = withTiming(visible ? height * 0.25 : height, { duration: 300 });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!product) return null;

    return (
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <View style={styles.modalContent}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                <View style={styles.ratingRow}>
                    <FontAwesome name="star" size={14} color="#f1c40f" />
                    <Text style={styles.productRating}>{product.rating}</Text>
                </View>
                <View style={styles.buttonRow}>

                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => {
                            addToCart(product); // ✅ Add to cart context
                            Alert.alert('Cart', `${product.name} added to cart`);
                            onClose(); // ✅ Optional: close modal after adding
                        }}

                    >
                        <Text style={styles.cartButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
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
        height: '75%',
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
        padding: 20,
    },
    productImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },
    productPrice: {
        fontSize: 16,
        color: '#3b82f6',
        marginTop: 6,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    productRating: {
        fontSize: 13,
        marginLeft: 5,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 14,
        justifyContent: 'space-between',
    },
    buyButton: {
        backgroundColor: '#10b981',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flex: 1,
        marginRight: 8,
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cartButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flex: 1,
        marginLeft: 8,
    },
    cartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontSize: 13,
    },
});
