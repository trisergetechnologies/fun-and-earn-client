import { getToken } from '@/helpers/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
const { BASE_URL } = Constants.expoConfig?.extra || {};

type Product = {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
};

type CartItem = Product & { qty: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'user_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);


  // Load cart from storage on mount

    const fetchCart = async () => {
    const url = `${BASE_URL}/ecart/user/cart/getcart`
    const token = await getToken();
 
    try {
      const res = await axios.get(url, {headers:{
        Authorization: `Bearer ${token}`
      }});

      if (res.data.success) {
        console.log(res.data.data.items);
        setCart(res.data.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(err =>
      console.error('Failed to save cart', err)
    );
  }, [cart]);

  const addToCart = async (product: Product) => {

    const url = `${BASE_URL}/ecart/user/cart/getcart`
    const addUrl = `${BASE_URL}/ecart/user/cart/addcart`
    const token = await getToken();
    //  console.log('🛒 Adding to cart:', product);
    // setCart((prev) => {
    //   const existing = prev.find((item) => item.id === product.id);
    //   if (existing) {
    //     return prev.map((item) =>
    //       item.id === product.id ? { ...item, qty: item.qty + 1 } : item
    //     );
    //   }
    //   return [...prev, { ...product, qty: 1 }];
    // });
      try {
    // Fetch existing cart
    const cartRes = await axios.get(url, {headers: {Authorization: `Bearer ${token}`}});
    const currentCart = cartRes.data.cart || [];

    
    // Check if this product already exists in the cart
    const existingItem = currentCart.find(
      (item: any) => item.productId === product.id || item.product._id === product.id
    );

    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    // Send API call to /cart/add
    const res = await axios.post(addUrl, {
      productId: product.id,
      quantity: newQuantity,
    },{
      headers: {Authorization: `Bearer ${token}`}
    });

    if (res.data.success) {
      console.log('✅ Product added/updated in cart');
      fetchCart(); // Refresh cart state
    } else {
      console.warn('⚠️ Failed to add to cart:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Error adding to cart:', err);
  }
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty } : item
      )
    );
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQty }}
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