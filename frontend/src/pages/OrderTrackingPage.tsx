import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, Truck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    fullAddress?: string;
    label?: string;
    houseNumber?: string;
    streetName?: string;
    villageArea?: string;
    townCity?: string;
    district?: string;
    postalCode?: string;
  };
  paymentMethod?: string;
  paymentDetails?: {
    cardType?: string;
    lastFourDigits?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('pharmacy_token');
        const response = await axios.get(`http://localhost:5000/api/v1/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrderData(response.data.data.order);
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate, isAuthenticated]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(orderData.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusIcon = (status: OrderData['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-white" />;
      case 'processing':
        return <Package className="h-6 w-6 text-white" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-white" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'cancelled':
        return <Clock className="h-6 w-6 text-white" />;
      default:
        return <Clock className="h-6 w-6 text-white" />;
    }
  };

  const getStatusColor = (status: OrderData['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-indigo-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold">Order #{orderData.orderNumber}</h2>
            <p className="text-gray-500">Placed on: {formattedDate}</p>
          </div>
          <span className={`px-4 py-2 ${getStatusColor(orderData.status)} text-white rounded-full`}>
            {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`rounded-full ${getStatusColor('pending')} p-2`}>
                {getStatusIcon('pending')}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Order Placed</h3>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`rounded-full ${getStatusColor('processing')} p-2`}>
                {getStatusIcon('processing')}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Processing</h3>
                <p className="text-sm text-gray-500">Your order is being prepared</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`rounded-full ${getStatusColor('shipped')} p-2`}>
                {getStatusIcon('shipped')}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Shipped</h3>
                <p className="text-sm text-gray-500">Your order is on the way</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`rounded-full ${getStatusColor('delivered')} p-2`}>
                {getStatusIcon('delivered')}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Delivered</h3>
                <p className="text-sm text-gray-500">Order completed</p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200 -z-10"></div>
        </div>

        {orderData.shippingAddress && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Delivery Address</h4>
            <p className="text-gray-600">
              {orderData.shippingAddress.fullAddress || 
                `${orderData.shippingAddress.houseNumber || ''} ${orderData.shippingAddress.streetName || ''}, 
                 ${orderData.shippingAddress.villageArea || ''}, ${orderData.shippingAddress.townCity || ''}, 
                 ${orderData.shippingAddress.district || ''} ${orderData.shippingAddress.postalCode || ''}`.trim()}
            </p>
          </div>
        )}

        <div className="mt-8">
          <h4 className="font-semibold mb-4">Order Items</h4>
          <div className="space-y-4">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium">{item.name}</h5>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Rs. {item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{orderData.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formattedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(orderData.status)} text-white`}>
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {orderData.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;