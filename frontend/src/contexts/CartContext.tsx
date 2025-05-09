import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import axios from 'axios';
import { useAuth } from './useAuth';

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const getAuthToken = () => {
    const token = localStorage.getItem('pharmacy_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  };

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5000/api/v1/cart', {
        headers: {
          Authorization: `Bearer ${token}`
    }
      });
  
      const cartData = response.data.data.cart.items.map((item: any) => ({
        id: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity
      }));
      
      setCart(cartData);
    } catch (err) {
      setError('Failed to fetch cart items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!isAuthenticated) {
      setError('Please login to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      await axios.post(
        'http://localhost:5000/api/v1/cart/add',
        {
          productId: item.productId,
          quantity: item.quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchCart();
    } catch (err) {
      setError('Failed to add item to cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const removeFromCart = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      await axios.delete(`http://localhost:5000/api/v1/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await fetchCart();
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      await axios.patch(
        `http://localhost:5000/api/v1/cart/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchCart();
    } catch (err) {
      setError('Failed to update quantity');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      await axios.delete('http://localhost:5000/api/v1/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
    setCart([]);
    } catch (err) {
      setError('Failed to clear cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <CartContext.Provider value={{
      cart,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loading,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};