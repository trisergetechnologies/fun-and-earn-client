import { getToken } from '@/helpers/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

export type ProductVariation = {
  name: string;
  options: string[];
};

export type SelectedVariation = {
  name: string;
  value: string;
};

export type Product = {
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
  sellerId: string | { _id?: string; name?: string; email?: string };
  stock: number;
  title: string;
  updatedAt: string;
  variations?: ProductVariation[];
};

type CartItem = {
  productId: Product;
  quantity: number;
  selectedVariation?: SelectedVariation[];
};

export type AddToCartResult =
  | { success: true }
  | { success: false; message: string };

interface CartContextType {
  cart: CartItem[];
  totalGstAmount: number;
  deliveryCharge: number;
  addToCart: (product: Product, selectedVariation?: SelectedVariation[]) => Promise<AddToCartResult>;
  removeFromCart: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'user_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalGstAmount, setTotalGstAmount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const {isAuthenticated, isAuthLoading} = useAuth();


    const fetchCart = useCallback(async () => {
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`
    const token = await getToken();
 
    try {
      const res = await axios.get(url, {headers:{
        Authorization: `Bearer ${token}`
      }});

      if (res.data.success) {
        setCart(res.data.data.items);
        setTotalGstAmount(res.data.data.totalGstAmount);
        setDeliveryCharge(res.data.data.deliveryCharge);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if(isAuthLoading && !isAuthenticated) return
    fetchCart();
  }, [fetchCart, isAuthLoading, isAuthenticated]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(err =>
      console.error('Failed to save cart', err)
    );
  }, [cart]);

  const addToCart = async (
    product: Product,
    selectedVariation?: SelectedVariation[]
  ): Promise<AddToCartResult> => {
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`;
    const addUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/addcart`;
    const token = await getToken();

    try {
      const cartRes = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const currentCart = cartRes.data.data?.items ?? cartRes.data.cart ?? [];

      const existingItem = currentCart.find(
        (item: { productId?: string | { _id?: string }; product?: { _id?: string } }) =>
          item.productId === product._id ||
          (typeof item.productId === 'object' && item.productId?._id === product._id) ||
          item.product?._id === product._id
      );

      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

      const res = await axios.post(
        addUrl,
        {
          productId: product._id,
          quantity: newQuantity,
          selectedVariation: selectedVariation || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }

      const message = res.data.message || 'Could not add to cart';
      console.warn('Failed to add to cart:', message);
      return { success: false, message };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Could not add to cart'
        : 'Could not add to cart';
      return { success: false, message };
    }
  };

  const removeFromCart = async (id: string) => {
    const removeItemUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/removeitem`
    const token = await getToken();

    try {
      const productId = id;
      const res = await axios.delete(`${removeItemUrl}/${productId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        },
        params: {
          productId: id
        }
      })

      if (res.data.success) {
        
        fetchCart(); // Refresh cart state
      } else {
        console.warn('⚠️ Failed to remove item:', res.data.message);
      }
    } catch (err) {
      console.error('❌ Error removing the item:', err);
      fetchCart();
      throw err;
    }
  };

  const updateQty = async (id: string, qty: number) => {

    const updateUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/updatecart`
    const token = await getToken();

    try {
    const res = await axios.patch(updateUrl, {
      productId: id,
      quantity: qty,
    },{
      headers: {Authorization: `Bearer ${token}`}
    });

    if (res.data.success) {
    
      fetchCart(); // Refresh cart state
    } else {
      console.warn('⚠️ Failed to update cart:', res.data.message);
    }
    } catch (err) {
      console.error('❌ Error updating the cart:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const refreshCart = useCallback(() => fetchCart(), [fetchCart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQty, refreshCart, totalGstAmount, deliveryCharge }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};