import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/useAuth';
import { toast } from 'react-toastify';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed with checkout');
      navigate('/signin');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Calculate total with tax
    const totalWithTax = totalPrice + (totalPrice * 0.1);

    // Navigate to payment gateway
    navigate('/payment', {
      state: {
        totalAmount: totalWithTax,
        items: cart
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex items-center">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          <Link to={`/products/${item.productId}`} className="hover:text-primary-600">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-error-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="mx-4 text-gray-800 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="ml-6 text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Proceed to Payment
            </button>
            
            <Link
              to="/products"
              className="block text-center mt-4 text-primary-600 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;