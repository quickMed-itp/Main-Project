import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import UploadPrescriptionPage from './pages/UploadPrescriptionPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PrescriptionsAdmin from './pages/admin/PrescriptionsAdmin';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import MedicinesAdmin from './pages/admin/MedicinesAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import FeedbackAdmin from './pages/admin/FeedbackAdmin';
import InventoryAdmin from './pages/admin/InventoryAdmin';
import SuppliersAdmin from './pages/admin/SuppliersAdmin';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="upload-prescription" element={
          <ProtectedRoute>
            <UploadPrescriptionPage />
          </ProtectedRoute>
        } />
        <Route path="track-order" element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="prescriptions" element={<PrescriptionsAdmin />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="medicines" element={<MedicinesAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="customers" element={<CustomersAdmin />} />
        <Route path="feedback" element={<FeedbackAdmin />} />
        <Route path="inventory" element={<InventoryAdmin />} />
        <Route path="suppliers" element={<SuppliersAdmin />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;