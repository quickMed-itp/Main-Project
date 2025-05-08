import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Pill, X } from 'lucide-react';
import axios from 'axios';

const Footer: React.FC = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerRole, setRegisterRole] = useState<'pharmacy' | 'doctor' | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    pharmacyRegNumber: '',
    doctorId: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const handleOpenRegister = (role: 'pharmacy' | 'doctor') => {
    setRegisterRole(role);
    setShowRegisterModal(true);
    setForm({ name: '', email: '', password: '', phone: '', address: '', pharmacyRegNumber: '', doctorId: '' });
    setRegisterError(null);
    setRegisterSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);
    setRegisterLoading(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: registerRole,
      };
      if (registerRole === 'pharmacy') {
        payload.pharmacyRegNumber = form.pharmacyRegNumber;
        payload.address = form.address;
      }
      if (registerRole === 'doctor') {
        payload.doctorId = form.doctorId;
      }
      await axios.post('/auth/signup', payload);
      setRegisterSuccess('Registration successful! You can now sign in.');
      setTimeout(() => setShowRegisterModal(false), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError && axios.isAxiosError(err)) {
        setRegisterError(err.response?.data?.message || 'Registration failed.');
      } else {
        setRegisterError('Registration failed.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Pill size={24} className="text-primary-400" />
              <span className="text-xl font-bold">MediPlus</span>
            </div>
            <p className="text-gray-300 mb-4">
              Providing quality healthcare products and exceptional service since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <button
                  className="text-gray-300 hover:text-primary-400 transition-colors underline bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => handleOpenRegister('pharmacy')}
                >
                  Register as Pharmacist
                </button>
              </li>
              <li>
                <button
                  className="text-gray-300 hover:text-primary-400 transition-colors underline bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => handleOpenRegister('doctor')}
                >
                  Register as Doctor
                </button>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/upload-prescription" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Upload Prescription
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Health Articles
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Medication Reminders
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Free Consultation
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  123 Healthcare Avenue, Meditown, MT 54321, United States
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">contact@mediplus.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MediPlus Pharmacy. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white text-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowRegisterModal(false)}>
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Register as {registerRole === 'pharmacy' ? 'Pharmacist' : 'Doctor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                  required
                />
              </div>
              {registerRole === 'pharmacy' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pharmacy Registration Number</label>
                    <input
                      type="text"
                      name="pharmacyRegNumber"
                      value={form.pharmacyRegNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      required
                    />
                  </div>
                </>
              )}
              {registerRole === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor ID</label>
                  <input
                    type="text"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    required
                  />
                </div>
              )}
              {registerError && <div className="text-red-600 text-sm mt-2">{registerError}</div>}
              {registerSuccess && <div className="text-green-600 text-sm mt-2">{registerSuccess}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={registerLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  disabled={registerLoading}
                >
                  {registerLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;