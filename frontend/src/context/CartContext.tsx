import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// 1. Define Standard Types (The "Contract")
export interface CartItem {
  _id: string; // MongoDB always uses _id
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number; // For Navbar
  addToCart: (sweet: any, quantity?: number) => Promise<void>;
  removeFromCart: (sweetId: string) => Promise<void>;
  updateQuantity: (sweetId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); 

  // Fetch Cart Helper
  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.get('/cart');
      
      // Transform Backend Data to Frontend Format
      // Backend: { items: [{ sweetId: { _id, name... }, quantity: 2 }] }
      // Frontend: [{ _id, name, quantity: 2 }]
      const formattedItems = res.data.items.map((item: any) => ({
        _id: item.sweetId._id || item.sweetId, // Handle population
        name: item.name || item.sweetId.name,
        price: item.price || item.sweetId.price,
        image: item.sweetId.image || '',
        quantity: item.quantity
      }));
      
      setCart(formattedItems);
    } catch (err) {
      console.error("Cart fetch error:", err);
      // Don't clear cart on error, keep old state or empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]); 

  // Add Item
  const addToCart = async (sweet: any, quantity = 1) => {
    if (!user) return alert("Please login to add to cart");

    // Optimistic UI Update
    setCart(prev => {
      const existing = prev.find(item => item._id === sweet._id);
      if (existing) {
        return prev.map(item => item._id === sweet._id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      }
      return [...prev, { ...sweet, _id: sweet._id, quantity }];
    });

    try {
      await api.post('/cart/add', { sweetId: sweet._id, quantity });
    } catch (err) {
      console.error("Add failed", err);
      fetchCart(); // Revert if server fails
    }
  };

  // Update Quantity
  const updateQuantity = async (sweetId: string, quantity: number) => {
    if (quantity < 1) return;

    setCart(prev => prev.map(item => 
      item._id === sweetId ? { ...item, quantity } : item
    ));

    // Note: Ideally backend should have a specific update route. 
    // Re-using 'add' might duplicate items depending on backend logic.
    // Ideally: await api.put('/cart/update', { sweetId, quantity })
  };

  // Remove Item
  const removeFromCart = async (sweetId: string) => {
    setCart(prev => prev.filter(item => item._id !== sweetId));
    // Ideally call backend: await api.delete(`/cart/${sweetId}`);
  };

  const clearCart = () => setCart([]);

  // Derived State
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartTotal, 
      cartItemCount, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      loading 
    }}>
      {children}
    </CartContext.Provider>
  );
};