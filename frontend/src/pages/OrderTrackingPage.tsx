import React from 'react';
import { Package, CheckCircle, Clock, Truck } from 'lucide-react';

const OrderTrackingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold">Order #12345</h2>
            <p className="text-gray-500">Placed on: March 15, 2025</p>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            In Transit
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
                <p className="text-sm text-gray-500">March 15, 2025 9:00 AM</p>
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
                <p className="text-sm text-gray-500">March 15, 2025 2:30 PM</p>
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
                <p className="text-sm text-gray-500">March 16, 2025 10:15 AM</p>
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
                <p className="text-sm text-gray-500">Estimated: March 17, 2025</p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200 -z-10"></div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Delivery Address</h4>
          <p className="text-gray-600">
            John Doe<br />
            123 Main Street<br />
            Apartment 4B<br />
            New York, NY 10001
          </p>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#12345</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-01-15</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$99.99</td>
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