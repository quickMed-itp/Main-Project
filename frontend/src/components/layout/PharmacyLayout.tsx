import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { 
  Home, 
  Package, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const PharmacyLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/pharmacy" className="text-xl font-bold text-primary-600">
                  Pharmacy Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <Link
                to="/pharmacy"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home size={20} className="inline-block mr-1" />
                Dashboard
              </Link>
              <Link
                to="/pharmacy/orders"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Package size={20} className="inline-block mr-1" />
                Orders
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User size={20} className="inline-block mr-1" />
                  {user?.name}
                  <ChevronDown size={16} className="ml-1" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/pharmacy/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/pharmacy/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/pharmacy"
                className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <Home size={20} className="inline-block mr-1" />
                Dashboard
              </Link>
              <Link
                to="/pharmacy/orders"
                className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <Package size={20} className="inline-block mr-1" />
                Orders
              </Link>
              <Link
                to="/pharmacy/profile"
                className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <User size={20} className="inline-block mr-1" />
                Profile
              </Link>
              <Link
                to="/pharmacy/settings"
                className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <Settings size={20} className="inline-block mr-1" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <LogOut size={20} className="inline-block mr-1" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PharmacyLayout; 