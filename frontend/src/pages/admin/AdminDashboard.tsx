import React from 'react';
import { Users, ShoppingBag, FileText, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockOrders, mockUsers, mockPrescriptions } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  // Calculate some statistics for the dashboard
  const totalCustomers = mockUsers.filter(user => user.role === 'customer').length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingPrescriptions = mockPrescriptions.filter(
    prescription => prescription.status === 'pending'
  ).length;
  
  // For demonstration: Pretend we have historic data to show growth
  const customerGrowth = 12.5;
  const revenueGrowth = 8.3;
  const orderGrowth = -3.2;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to the pharmacy management dashboard.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalCustomers}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
              <Users size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className={`flex items-center ${customerGrowth >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {customerGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="ml-1 text-sm font-medium">{Math.abs(customerGrowth)}%</span>
            </div>
            <span className="text-gray-500 text-sm ml-1.5">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className={`flex items-center ${orderGrowth >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {orderGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="ml-1 text-sm font-medium">{Math.abs(orderGrowth)}%</span>
            </div>
            <span className="text-gray-500 text-sm ml-1.5">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center text-success-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="ml-1 text-sm font-medium">{Math.abs(revenueGrowth)}%</span>
            </div>
            <span className="text-gray-500 text-sm ml-1.5">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Prescriptions</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingPrescriptions}</h3>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600">
              <FileText size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-gray-500 text-sm">Requires attention</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockOrders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.userName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'delivered' ? 'bg-success-100 text-success-800' : 
                          order.status === 'shipped' ? 'bg-primary-100 text-primary-800' :
                          order.status === 'processing' ? 'bg-secondary-100 text-secondary-800' :
                          order.status === 'cancelled' ? 'bg-error-100 text-error-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Analytics Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Analytics</h2>
            <div className="flex items-center space-x-2">
              <button className="text-xs font-medium bg-primary-50 text-primary-600 px-2 py-1 rounded">
                Weekly
              </button>
              <button className="text-xs font-medium text-gray-500 hover:text-primary-600 px-2 py-1 rounded">
                Monthly
              </button>
              <button className="text-xs font-medium text-gray-500 hover:text-primary-600 px-2 py-1 rounded">
                Yearly
              </button>
            </div>
          </div>
          
          <div className="relative h-64 mt-4">
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <TrendingUp size={48} className="text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Revenue chart placeholder</p>
              <p className="text-gray-400 text-xs mt-1">Revenue is up 8.3% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;