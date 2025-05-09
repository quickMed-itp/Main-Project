import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useCart } from '../contexts/CartContext';

interface AddressResponse {
  id: string;
  label: string;
  address: string;
  houseNumber?: string;
  streetName?: string;
  villageArea?: string;
  townCity?: string;
  district?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface Address {
  id: string;
  label?: string;
  address: string;
  houseNumber?: string;
  streetName?: string;
  villageArea?: string;
  townCity?: string;
  district?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface NewAddressForm {
  label: string;
  houseNumber: string;
  streetName: string;
  villageArea: string;
  townCity: string;
  district: string;
  postalCode: string;
}

interface OrderData {
  orderId: string;
  date: string;
  status: string;
  total: number;
  cardType: string;
  cardLastFour: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  estimatedDelivery: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    label: '',
    houseNumber: '',
    streetName: '',
    villageArea: '',
    townCity: '',
    district: '',
    postalCode: ''
  });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({
    cardType: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    address: ''
  });
  const [selectedCardType, setSelectedCardType] = useState<'visa' | 'mastercard' | ''>('');

  // Calculate order summary values
  const orderSummary = {
    subtotal: totalPrice,
    shipping: 300, // Fixed shipping cost of Rs. 300
    total: totalPrice + 300,
    estimatedDelivery: '2-4 days'
  };

  // Fetch addresses from backend on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('pharmacy_token');
        const res = await axios.get('http://localhost:5000/api/users/me/addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedAddresses = (res.data.data.addresses || []).map((addr: AddressResponse, idx: number) => ({
          id: addr.id || idx.toString(),
          label: addr.label || `Address ${idx + 1}`,
          address: addr.address || addr,
          isDefault: addr.isDefault || false
        }));
        setAddresses(fetchedAddresses);
        
        // Handle address selection logic
        if (fetchedAddresses.length > 0) {
          // First try to find default address
          const defaultAddress = fetchedAddresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            // If default address exists, select it
            setSelectedAddress(defaultAddress.id);
            console.log('Selected default address:', defaultAddress.address);
          } else {
            // If no default address, select the first address
            setSelectedAddress(fetchedAddresses[0].id);
            console.log('Selected first address (no default found):', fetchedAddresses[0].address);
          }
        } else {
          // If no addresses exist, set empty selection
          setSelectedAddress('');
          console.log('No addresses available');
        }
        
        setShowAddAddress(fetchedAddresses.length === 0);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        setAddresses([]);
        setSelectedAddress('');
        setShowAddAddress(true);
      }
    };
    fetchAddresses();
  }, []);

  // Card validation: Only Visa (4...) or MasterCard (5...)
  const isValidCard = (number: string) => {
    // Remove spaces from the card number for validation
    const cleanNumber = number.replace(/\s+/g, '');
    
    if (!selectedCardType) {
      setErrors(prev => ({ ...prev, cardType: 'Please select a card type' }));
      return false;
    }

    if (selectedCardType === 'visa') {
      return /^4[0-9]{12}(?:[0-9]{3})?$/.test(cleanNumber);
    } else if (selectedCardType === 'mastercard') {
      return /^5[1-5][0-9]{14}$/.test(cleanNumber);
    }
    return false;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    // Format as MM/YY
    if (digits.length <= 2) {
      return digits;
    }
    
    const month = digits.slice(0, 2);
    const year = digits.slice(2, 4);
    
    // Ensure month is between 01-12
    const monthNum = parseInt(month);
    if (monthNum > 12) {
      return `12/${year}`;
    }
    
    return `${month}/${year}`;
  };

  const validateExpiryDate = (expiry: string): boolean => {
    if (!expiry) return false;
    
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
    const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
    
    // Check if month is valid (1-12)
    if (monthNum < 1 || monthNum > 12) return false;
    
    // Check if year is valid (current year or future)
    if (yearNum < currentYear) return false;
    
    // If year is current year, check if month is not in the past
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'number') {
      const formattedNumber = formatCardNumber(e.target.value);
      setCard({ ...card, number: formattedNumber });
    } else if (e.target.name === 'expiry') {
      const formattedExpiry = formatExpiryDate(e.target.value);
      setCard({ ...card, expiry: formattedExpiry });
    } else {
      setCard({ ...card, [e.target.name]: e.target.value });
    }
    setErrors(prev => ({ ...prev, cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', address: '' }));
  };

  const validateCard = () => {
    const newErrors = {
      cardType: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      address: ''
    };

    if (!selectedCardType) {
      newErrors.cardType = 'Please select a card type';
    }

    if (!card.number) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!isValidCard(card.number)) {
      newErrors.cardNumber = `Invalid ${selectedCardType} card number`;
    }

    if (!card.name) {
      newErrors.cardName = 'Name on card is required';
    }

    if (!card.expiry) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!validateExpiryDate(card.expiry)) {
      newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
    }

    if (!card.cvv) {
      newErrors.cardCvv = 'CVV is required';
    } else if (!/^[0-9]{3,4}$/.test(card.cvv)) {
      newErrors.cardCvv = 'Invalid CVV';
    }

    if (!selectedAddress) {
      newErrors.address = 'Please select a delivery address';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const formatAddress = (address: NewAddressForm): string => {
    const parts = [
      address.houseNumber,
      address.streetName,
      address.villageArea,
      address.townCity,
      `${address.district} District`,
      address.postalCode
    ].filter(Boolean); // Remove empty strings
    
    return parts.join(', ');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newAddress.label || !newAddress.houseNumber || !newAddress.streetName || 
        !newAddress.townCity || !newAddress.district || !newAddress.postalCode) {
      return;
    }

    try {
      const token = localStorage.getItem('pharmacy_token');
      const formattedAddress = formatAddress(newAddress);
      
      const addressData = {
        label: newAddress.label,
        address: formattedAddress,
        houseNumber: newAddress.houseNumber,
        streetName: newAddress.streetName,
        villageArea: newAddress.villageArea,
        townCity: newAddress.townCity,
        district: newAddress.district,
        postalCode: newAddress.postalCode
      };

      const res = await axios.post('http://localhost:5000/api/users/me/addresses', addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedAddresses = (res.data.data.addresses || []).map((addr: AddressResponse, idx: number) => ({
        id: addr.id || idx.toString(),
        label: addr.label || `Address ${idx + 1}`,
        address: addr.address || addr,
        houseNumber: addr.houseNumber || '',
        streetName: addr.streetName || '',
        villageArea: addr.villageArea || '',
        townCity: addr.townCity || '',
        district: addr.district || '',
        postalCode: addr.postalCode || '',
        isDefault: addr.isDefault || false
      }));
      
      setAddresses(updatedAddresses);
      setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]?.id || '');
      setNewAddress({
        label: '',
        houseNumber: '',
        streetName: '',
        villageArea: '',
        townCity: '',
        district: '',
        postalCode: ''
      });
      setShowAddAddress(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCard()) {
      return;
    }

    try {
      // Get the selected address
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      if (!selectedAddressData) {
        setErrors(prev => ({ ...prev, address: 'Please select a delivery address' }));
        return;
      }

      console.log('Selected Address:', selectedAddressData);
      console.log('Cart Items:', cart);
      console.log('Total Price:', totalPrice);

      // Create order data with complete address details
      const orderData = {
        orderItems: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: totalPrice,
        shippingAddress: {
          label: selectedAddressData.label || 'Home',
          houseNumber: selectedAddressData.houseNumber || '',
          streetName: selectedAddressData.streetName || '',
          villageArea: selectedAddressData.villageArea || '',
          townCity: selectedAddressData.townCity || '',
          district: selectedAddressData.district || '',
          postalCode: selectedAddressData.postalCode || '',
          fullAddress: selectedAddressData.address || ''
        },
        status: 'pending'
      };

      console.log('Order Data being sent:', JSON.stringify(orderData, null, 2));

      // Create order in backend
      const token = localStorage.getItem('pharmacy_token');
      if (!token) {
        console.error('No authentication token found');
        setErrors(prev => ({ 
          ...prev, 
          cardNumber: 'Authentication error. Please login again.' 
        }));
        return;
      }

      console.log('Sending request to create order...');
      const response = await axios.post(
        'http://localhost:5000/api/v1/orders',
        orderData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order creation response:', response.data);

      // Clear the cart after successful order
      await clearCart();

      // Save order data to localStorage for tracking page
      const trackingData: OrderData = {
        orderId: response.data.data.order._id,
        date: new Date().toISOString(),
        status: 'processing',
        total: response.data.data.order.totalAmount,
        cardType: selectedCardType,
        cardLastFour: card.number.slice(-4),
        deliveryAddress: {
          street: selectedAddressData.streetName || '',
          city: selectedAddressData.townCity || '',
          state: selectedAddressData.district || '',
          zipCode: selectedAddressData.postalCode || ''
        },
        estimatedDelivery: '2-4 days',
        items: response.data.data.order.items
      };

      localStorage.setItem('currentOrder', JSON.stringify(trackingData));

      // Navigate to order tracking page
      navigate('/order-tracking');
    } catch (error) {
      console.error('Order creation failed:', error);
      console.error('Error details:', {
        message: error instanceof AxiosError ? error.message : 'Unknown error',
        response: error instanceof AxiosError ? error.response?.data : null,
        status: error instanceof AxiosError ? error.response?.status : null
      });
      
      // Show a more specific error message based on the error type
      let errorMessage = 'Failed to create order. Please try again.';
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setErrors(prev => ({ 
        ...prev, 
        cardNumber: errorMessage
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Payment & Address */}
        <div className="flex-1 space-y-8">
          {/* Payment Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 ${
                  selectedCardType === 'visa'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                }`}
                onClick={() => {
                  setSelectedCardType('visa');
                  setErrors(prev => ({ ...prev, cardType: '' }));
                }}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
                  alt="Visa" 
                  className="h-6 object-contain"
                />
                <span>Visa</span>
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 ${
                  selectedCardType === 'mastercard'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                }`}
                onClick={() => {
                  setSelectedCardType('mastercard');
                  setErrors(prev => ({ ...prev, cardType: '' }));
                }}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" 
                  alt="MasterCard" 
                  className="h-6 object-contain"
                />
                <span>MasterCard</span>
              </button>
            </div>
            {errors.cardType && <p className="text-red-500 text-sm mb-4">{errors.cardType}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Card Number</label>
                <input
                  type="text"
                  name="number"
                  value={card.number}
                  onChange={handleCardChange}
                  className={`w-full border rounded px-3 py-2 ${errors.cardNumber ? 'border-red-500' : ''}`}
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                  required
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Name on Card</label>
                <input
                  type="text"
                  name="name"
                  value={card.name}
                  onChange={handleCardChange}
                  className={`w-full border rounded px-3 py-2 ${errors.cardName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Expiry</label>
                  <input
                    type="text"
                    name="expiry"
                    value={card.expiry}
                    onChange={handleCardChange}
                    className={`w-full border rounded px-3 py-2 ${errors.cardExpiry ? 'border-red-500' : ''}`}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  {errors.cardExpiry && <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>}
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={card.cvv}
                    onChange={handleCardChange}
                    className={`w-full border rounded px-3 py-2 ${errors.cardCvv ? 'border-red-500' : ''}`}
                    maxLength={4}
                    required
                  />
                  {errors.cardCvv && <p className="text-red-500 text-sm mt-1">{errors.cardCvv}</p>}
                </div>
              </div>
            </form>
          </div>
          {/* Address Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-2 mb-2">
              {addresses.map(addr => (
                <label key={addr.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => {
                      setSelectedAddress(addr.address);
                      setErrors(prev => ({ ...prev, address: '' }));
                    }}
                    className="accent-primary-600"
                  />
                  <span className="font-medium">{addr.label}:</span>
                  <span>{addr.address}</span>
                  {addr.isDefault && <span className="text-sm text-gray-500">(Default)</span>}
                </label>
              ))}
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            <button
              type="button"
              className="text-primary-600 hover:underline text-sm mt-2"
              onClick={() => setShowAddAddress(true)}
            >
              + Add New Address
            </button>
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="mt-2 space-y-2 bg-gray-50 p-3 rounded">
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office)"
                  value={newAddress.label}
                  onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="House/Building Name or Number"
                  value={newAddress.houseNumber}
                  onChange={e => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Name"
                  value={newAddress.streetName}
                  onChange={e => setNewAddress({ ...newAddress, streetName: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Village/Area Name (Optional)"
                  value={newAddress.villageArea}
                  onChange={e => setNewAddress({ ...newAddress, villageArea: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Town/City"
                  value={newAddress.townCity}
                  onChange={e => setNewAddress({ ...newAddress, townCity: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="District"
                  value={newAddress.district}
                  onChange={e => setNewAddress({ ...newAddress, district: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={newAddress.postalCode}
                  onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-primary-600 text-white px-4 py-1 rounded">Save</button>
                  <button type="button" className="text-gray-600" onClick={() => setShowAddAddress(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
        {/* Right Column: Order Summary */}
        <div className="w-full md:w-96 bg-gray-50 rounded-lg shadow p-6 h-fit self-start">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>Rs. {orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>Rs. {orderSummary.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>Rs. {orderSummary.total.toFixed(2)}</span>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <span>Estimated Delivery: </span>
            <span className="font-medium">{orderSummary.estimatedDelivery}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 