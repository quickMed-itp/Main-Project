import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import axios from 'axios';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

interface Notification {
  id: string;
  type: 'order' | 'expiry';
  message: string;
  timestamp: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: {
    name: string;
  };
  createdAt: string;
}

interface Batch {
  _id: string;
  batchNumber: string;
  productId: {
    name: string;
  };
  expiryDate: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('pharmacy_token');
        if (!token) return;

        // Fetch new orders
        const ordersResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/orders/admin/all`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Fetch expiring products
        const batchesResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/batches/expiring`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const newNotifications: Notification[] = [];

        // Add new orders from last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        if (ordersResponse.data.data.orders) {
          ordersResponse.data.data.orders.forEach((order: Order) => {
            if (new Date(order.createdAt) > oneDayAgo) {
              newNotifications.push({
                id: order._id,
                type: 'order',
                message: `New order #${order.orderNumber} from ${order.userId.name}`,
                timestamp: order.createdAt
              });
            }
          });
        }

        // Add expiring products
        if (batchesResponse.data.data.batches) {
          batchesResponse.data.data.batches.forEach((batch: Batch) => {
            const daysUntilExpiry = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 7) {
              newNotifications.push({
                id: batch._id,
                type: 'expiry',
                message: `${batch.productId.name} (Batch #${batch.batchNumber}) expires in ${daysUntilExpiry} days`,
                timestamp: batch.expiryDate
              });
            }
          });
        }

        // Sort notifications by timestamp (newest first)
        newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Refresh notifications every 2 seconds
    const interval = setInterval(fetchNotifications, 2 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-primary-600 transition-colors focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">MediPlus Admin</h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={toggleNotifications}
            className="relative text-gray-600 hover:text-primary-600 transition-colors p-1.5"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Notifications</h3>
                <button
                  onClick={() => {
                    const fetchNotifications = async () => {
                      try {
                        const token = localStorage.getItem('pharmacy_token');
                        if (!token) return;

                        const [ordersResponse, batchesResponse] = await Promise.all([
                          axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/admin/all`, {
                            headers: { Authorization: `Bearer ${token}` }
                          }),
                          axios.get(`${import.meta.env.VITE_API_BASE_URL}/batches/expiring`, {
                            headers: { Authorization: `Bearer ${token}` }
                          })
                        ]);

                        const newNotifications: Notification[] = [];
                        const oneDayAgo = new Date();
                        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

                        if (ordersResponse.data.data.orders) {
                          ordersResponse.data.data.orders.forEach((order: Order) => {
                            if (new Date(order.createdAt) > oneDayAgo) {
                              newNotifications.push({
                                id: order._id,
                                type: 'order',
                                message: `New order #${order.orderNumber} from ${order.userId.name}`,
                                timestamp: order.createdAt
                              });
                            }
                          });
                        }

                        if (batchesResponse.data.data.batches) {
                          batchesResponse.data.data.batches.forEach((batch: Batch) => {
                            const daysUntilExpiry = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (daysUntilExpiry <= 7) {
                              newNotifications.push({
                                id: batch._id,
                                type: 'expiry',
                                message: `${batch.productId.name} (Batch #${batch.batchNumber}) expires in ${daysUntilExpiry} days`,
                                timestamp: batch.expiryDate
                              });
                            }
                          });
                        }

                        newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        setNotifications(newNotifications);
                        setUnreadCount(newNotifications.length);
                      } catch (error) {
                        console.error('Error refreshing notifications:', error);
                      }
                    };
                    fetchNotifications();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">No new notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex items-start space-x-2">
                      {notification.type === 'order' ? (
                        <Package className="w-4 h-4 text-blue-500 mt-1" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-1" />
                      )}
                      <div>
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
              <User size={16} />
            </div>
            <span className="hidden md:block font-medium">{user?.name}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
              >
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
              >
                <div className="flex items-center space-x-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;