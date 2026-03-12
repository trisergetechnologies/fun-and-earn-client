import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import { SelectedVariation } from '../components/CartContext';
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

interface ProductVariation {
    name: string;
    options: string[];
}

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
        variations?: ProductVariation[];
    } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
    const translateY = useSharedValue(height);
    const { addToCart } = useCart();
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

    React.useEffect(() => {
        translateY.value = withTiming(visible ? height * 0.1 : height, { duration: 300 });
    }, [visible]);

    React.useEffect(() => {
        if (visible) {
            setSelectedVariations({});
        }
    }, [visible, product?._id]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!product) return null;

    const hasVariations = product.variations && product.variations.length > 0;
    const allVariationsSelected = hasVariations
        ? product.variations!.every(v => selectedVariations[v.name])
        : true;

    const handleAddToCart = () => {
        if (hasVariations && !allVariationsSelected) {
            Alert.alert('Select Options', 'Please select all product options before adding to cart.');
            return;
        }

        const variationArr: SelectedVariation[] = hasVariations
            ? product.variations!.map(v => ({ name: v.name, value: selectedVariations[v.name] }))
            : [];

        addToCart(product, variationArr);
        Alert.alert('Cart', `${product.title} added to cart`);
        onClose();
    };

    return (
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <View style={styles.modalContent}>

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
                    <View style={styles.priceRow}>
                        {product.discountPercent > 0 && (
                            <Text style={styles.originalPrice}>₹{product.price}</Text>
                        )}
                        <Text style={styles.productPrice}>₹{product.finalPrice}</Text>
                        {product.discountPercent > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>{product.discountPercent}% OFF</Text>
                            </View>
                        )}
                    </View>

                    {hasVariations && product.variations!.map((variation) => (
                        <View key={variation.name} style={styles.variationSection}>
                            <Text style={styles.variationLabel}>{variation.name}</Text>
                            <View style={styles.variationOptions}>
                                {variation.options.map((option) => {
                                    const isSelected = selectedVariations[variation.name] === option;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.variationChip,
                                                isSelected && styles.variationChipSelected
                                            ]}
                                            onPress={() => setSelectedVariations(prev => ({
                                                ...prev,
                                                [variation.name]: option
                                            }))}
                                        >
                                            <Text style={[
                                                styles.variationChipText,
                                                isSelected && styles.variationChipTextSelected
                                            ]}>{option}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.cartButton, !allVariationsSelected && styles.cartButtonDisabled]}
                            onPress={handleAddToCart}
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
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    originalPrice: {
        fontSize: 16,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: 18,
        color: '#3b82f6',
        fontWeight: '600',
    },
    discountBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16a34a',
    },
    variationSection: {
        marginTop: 16,
    },
    variationLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    variationOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    variationChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
    },
    variationChipSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    variationChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    variationChipTextSelected: {
        color: '#3b82f6',
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
    cartButtonDisabled: {
        opacity: 0.5,
    },
    cartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
    },
});
