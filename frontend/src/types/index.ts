export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: number;
  featured?: boolean;
  discount?: number;
  tags?: string[];
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  requiredPrescription: boolean;
  dosage: string;
  manufacturer: string;
  inStock: number;
  createdAt: string;
}

export interface Prescription {
  id: string;
  userId: string;
  userName: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  replied?: boolean;
  reply?: string;
  replyDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  createdAt: string;
}