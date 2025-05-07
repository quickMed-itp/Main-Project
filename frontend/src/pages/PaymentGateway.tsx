import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/useAuth';

interface PaymentDetails {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
}

const PaymentGateway: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalAmount, items } = location.state || { totalAmount: 0, items: [] };
    const { cart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const [selectedCard, setSelectedCard] = useState<'visa' | 'mastercard'>('visa');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please sign in to make a payment');
            navigate('/signin');
            return;
        }

        if (!cart || cart.length === 0) {
            toast.error('Your cart is empty');
            navigate('/cart');
            return;
        }
    }, [isAuthenticated, cart, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }
        // Format expiry date
        else if (name === 'expiryDate') {
            formattedValue = value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d{0,2})/, '$1/$2')
                .substr(0, 5);
        }

        setPaymentDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Here you would typically integrate with your payment processor
            // For now, we'll simulate a successful payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show payment success message
            toast.success('Payment processed successfully!', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Wait for the success message to be visible
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call your backend to process the order
            const token = localStorage.getItem('pharmacy_token');
            if (!token) {
                toast.error('Please sign in to place an order');
                navigate('/signin');
                return;
            }

            // Prepare order data
            const orderData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price
                })),
                totalAmount: totalAmount,
                shippingAddress: {
                    street: "123 Main Street",
                    city: "New York",
                    state: "NY",
                    zipCode: "10001"
                }
            };

            const response = await axios.post('http://localhost:5000/api/v1/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Clear the cart after successful order
            clearCart();

            // Show order success message
            toast.success('Order placed successfully! Redirecting to track order...', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Wait for 2 seconds to show the success message before redirecting
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Navigate to track order page with order details
            navigate('/track-order', {
                state: {
                    orderDetails: response.data.data.order,
                    showSuccess: true
                }
            });
        } catch (error: any) {
            console.error('Payment error:', error);
            
            if (error.response) {
                console.log('Error response:', error.response.data);
                const errorMessage = error.response.data?.message || 'Payment failed. Please try again.';
                toast.error(errorMessage);
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    Card Payment
                </h2>
                
                <div className="mb-6">
                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            className={`p-4 rounded-lg border-2 ${
                                selectedCard === 'visa'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedCard('visa')}
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                                alt="Visa"
                                className="h-8"
                            />
                        </button>
                        <button
                            className={`p-4 rounded-lg border-2 ${
                                selectedCard === 'mastercard'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedCard('mastercard')}
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                                alt="Mastercard"
                                className="h-8"
                            />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                            Card Number
                        </label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            maxLength={19}
                            value={paymentDetails.cardNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={paymentDetails.cardName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                maxLength={5}
                                value={paymentDetails.expiryDate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                                CVV
                            </label>
                            <input
                                type="password"
                                id="cvv"
                                name="cvv"
                                maxLength={3}
                                value={paymentDetails.cvv}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="123"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Total Amount:</span>
                            <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentGateway; 