import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import PharmacyLayout from "./components/layout/PharmacyLayout";
import DoctorLayout from "./components/layout/DoctorLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import UploadPrescriptionPage from "./pages/UploadPrescriptionPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaymentPage from './pages/PaymentPage';

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrescriptionsAdmin from "./pages/admin/PrescriptionsAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import MedicinesAdmin from "./pages/admin/MedicinesAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import CustomersAdmin from "./pages/admin/CustomersAdmin";
import FeedbackAdmin from "./pages/admin/FeedbackAdmin";
import InventoryAdmin from "./pages/admin/InventoryAdmin";
import SuppliersAdmin from "./pages/admin/SuppliersAdmin";

// Pharmacy Pages
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyOrders from "./pages/pharmacy/PharmacyOrders";
import PharmacyProfile from "./pages/pharmacy/PharmacyProfile";
import PharmacySettings from "./pages/pharmacy/PharmacySettings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorOrders from "./pages/doctor/DoctorOrders";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSettings from "./pages/doctor/DoctorSettings";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* User Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="upload-prescription"
          element={
            <ProtectedRoute>
              <UploadPrescriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="track-order"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>

      {/* Pharmacy Routes */}
      <Route path="/pharmacy" element={
        <ProtectedRoute requiredRole="pharmacy">
          <PharmacyLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<PharmacyDashboard />} />
        <Route path="orders" element={<PharmacyOrders />} />
        <Route path="profile" element={<PharmacyProfile />} />
        <Route path="settings" element={<PharmacySettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="orders" element={<DoctorOrders />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="settings" element={<DoctorSettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
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

      {/* Payment Route */}
      <Route path="/payment" element={<PaymentPage />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
