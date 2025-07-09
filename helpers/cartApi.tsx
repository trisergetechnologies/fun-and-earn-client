import axios from 'axios'; // Assuming Axios is set up with baseURL + token interceptor
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
};

type CartItem = {
  productId: Product;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  fetchCart: () => void;
  addToCart: (productId: string, quantity: number) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1️⃣ Fetch cart from backend
  const fetchCart = async () => {
    try {
      const res = await axios.get('/cart'); // GET /cart
      if (res.data.success) {
        setCart(res.data.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  // 2️⃣ Add to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const res = await axios.post('/cart/add', { productId, quantity }); // POST /cart/add
      if (res.data.success) {
        fetchCart(); // Refresh cart
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // 3️⃣ Update quantity
  const updateQty = async (productId: string, quantity: number) => {
    try {
      const res = await axios.put('/cart/update', { productId, quantity }); // Your backend must support this
      if (res.data.success) {
        fetchCart();
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  // 4️⃣ Remove from cart
  const removeFromCart = async (productId: string) => {
    try {
      const res = await axios.delete(`/cart/remove/${productId}`); // or /cart/remove via body
      if (res.data.success) {
        fetchCart();
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  // 5️⃣ Clear cart
  const clearCart = async () => {
    try {
      const res = await axios.delete('/cart/clear');
      if (res.data.success) {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, updateQty, clearCart }}>
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
