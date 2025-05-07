import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
        <button className="relative text-gray-600 hover:text-primary-600 transition-colors p-1.5">
          <Bell size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

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