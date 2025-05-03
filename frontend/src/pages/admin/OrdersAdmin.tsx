import React from 'react';
import { Package2 } from 'lucide-react';

const OrdersAdmin = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package2 className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Orders Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Orders List</h2>
          {/* Orders table will be implemented here */}
          <div className="text-gray-500">
            Orders management functionality will be implemented here
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersAdmin;