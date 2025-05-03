import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Pill, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Truck,
  Home
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 pt-16`}
    >
      <div className="p-4">
        <div className="mb-6">
          <NavLink to="/" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
            <Home size={18} />
            <span>Back to Website</span>
          </NavLink>
        </div>

        <nav className="space-y-1">
          <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/admin/prescriptions" icon={<FileText size={18} />} label="Prescriptions" />
          <NavItem to="/admin/products" icon={<Package size={18} />} label="Products" />
          <NavItem to="/admin/medicines" icon={<Pill size={18} />} label="Medicines" />
          <NavItem to="/admin/orders" icon={<ShoppingBag size={18} />} label="Orders" />
          <NavItem to="/admin/customers" icon={<Users size={18} />} label="Customers" />
          <NavItem to="/admin/feedback" icon={<MessageSquare size={18} />} label="Feedback" />
          <NavItem to="/admin/inventory" icon={<BarChart3 size={18} />} label="Inventory" />
          <NavItem to="/admin/suppliers" icon={<Truck size={18} />} label="Suppliers" />
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;