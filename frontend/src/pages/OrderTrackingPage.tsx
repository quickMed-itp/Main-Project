import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  orderId: string;
  date: string;
  status: string;
  total: number;
  cardType: string;
  cardLastFour: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  items: OrderItem[];
}

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (!savedOrder) {
      navigate('/'); // Redirect to home if no order data
      return;
    }
    setOrderData(JSON.parse(savedOrder));
  }, [navigate]);

  if (!orderData) {
    return <div>Loading...</div>;
  }

  const orderDate = new Date(orderData.date);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold">Order #{orderData.orderId}</h2>
            <p className="text-gray-500">Placed on: {formattedDate}</p>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            {orderData.status}
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="rounded-full bg-green-500 p-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Order Confirmed</h3>
                <p className="text-sm text-gray-500">{formattedDate} 9:00 AM</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="rounded-full bg-green-500 p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Order Processed</h3>
                <p className="text-sm text-gray-500">{formattedDate} 2:30 PM</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-500 p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">In Transit</h3>
                <p className="text-sm text-gray-500">{formattedDate} 10:15 AM</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-300 p-2">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-400">Delivered</h3>
                <p className="text-sm text-gray-500">Estimated: {orderData.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200 -z-10"></div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Delivery Address</h4>
          <p className="text-gray-600">
            {orderData.deliveryAddress}
          </p>
        </div>

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
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{orderData.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formattedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {orderData.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${orderData.total.toFixed(2)}</td>
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