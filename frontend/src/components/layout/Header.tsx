import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Pill, Search } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Pill size={24} className="text-primary-600" />
            <span className="text-xl font-bold text-primary-800">MediPlus</span>
          </Link>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex relative flex-1 mx-8 max-w-md">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-2.5 text-gray-500 hover:text-primary-600">
              <Search size={18} />
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Products
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Contact
            </Link>
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-700 hover:text-primary-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User size={22} />
                  <span className="hidden lg:inline">{user?.name.split(' ')[0]}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/track-order"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/upload-prescription"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      Prescriptions
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 py-3">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <nav className="px-4 pt-2 pb-4 space-y-1">
            <Link to="/" className="block py-2 text-gray-700 font-medium">
              Home
            </Link>
            <Link to="/products" className="block py-2 text-gray-700 font-medium">
              Products
            </Link>
            <Link to="/about" className="block py-2 text-gray-700 font-medium">
              About
            </Link>
            <Link to="/contact" className="block py-2 text-gray-700 font-medium">
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2 text-gray-700 font-medium">
                  Profile
                </Link>
                <Link to="/track-order" className="block py-2 text-gray-700 font-medium">
                  My Orders
                </Link>
                <Link to="/upload-prescription" className="block py-2 text-gray-700 font-medium">
                  Prescriptions
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-4 pt-2">
                <Link
                  to="/signin"
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;