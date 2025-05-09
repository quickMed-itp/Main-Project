import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    mainImage: string;
  };
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
  userId: string;
  userName: string;
}

const SHIPPING_COST: number = 0;
const TAX_RATE = 0.13; // 13% tax for example

const CartManagement: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, userId: '', userName: '' });
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const token = localStorage.getItem('pharmacy_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5000/api/v1/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const cartData = {
        ...response.data.data.cart,
        userId: (user as { _id?: string })?._id || '',
        userName: user?.name || ''
      };
      setCart(cartData);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate('/signin');
      }
      setError('Failed to fetch cart items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, logout, navigate]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const token = getAuthToken();
      await axios.patch(
        `http://localhost:5000/api/v1/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchCart();
    } catch (err) {
      setError('Failed to update quantity');
      console.error(err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:5000/api/v1/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
      console.error(err);
    }
  };


  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    }
  }, [isAuthenticated, user, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Please Login to View Your Cart</h2>
        <button
          onClick={() => navigate('/signin')}
          className="text-blue-600 hover:text-blue-800"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (error) return (
    <div className="text-center p-8 bg-red-50 rounded-lg">
      <p className="text-red-600">{error}</p>
      <button
        onClick={fetchCart}
        className="mt-4 text-blue-600 hover:text-blue-800"
      >
        Try Again
      </button>
    </div>
  );

  // Calculate tax and total
  const subtotal = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = subtotal + SHIPPING_COST + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items Section */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {cart.items.length === 0 ? (
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-4">Start shopping to add items to your cart</p>
              <button
                onClick={() => navigate('/products')}
                className="text-blue-600 hover:text-blue-800"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center gap-6 border-b pb-6 last:border-b-0 last:pb-0">
                  <img
                    src={
                      item.productId.mainImage
                        ? `http://localhost:5000/uploads/${item.productId.mainImage}`
                        : '/placeholder.png'
                    }
                    alt={item.productId.name}
                    className="w-24 h-24 object-cover rounded"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.productId.name}</h3>
                    <p className="text-gray-600 mt-1">${item.productId.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="p-1 rounded-full hover:bg-gray-100 border"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 border"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                    <span className="font-semibold text-lg">${(item.productId.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Order Summary Section */}
        <div className="w-full lg:w-96 bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>{SHIPPING_COST === 0 ? 'Free' : `$${SHIPPING_COST.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/payment')}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold mb-2"
            disabled={cart.items.length === 0}
          >
            Proceed to Checkout
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full text-primary-600 hover:text-primary-700 py-2 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartManagement; 