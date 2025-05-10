import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Plus, Package, Tag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

interface ApiError {
  message: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  totalStock: number;
  category: string;
  brand: string;
  mainImage: string;
  subImages: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockProducts: number;
}

interface ValidationError {
  field: string;
  message: string;
}

const ProductsAdmin: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: undefined
  });
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: undefined
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockProducts: 0
  });
  const [alertStatus, setAlertStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning' | null; message: string }>({
    type: null,
    message: ''
  });

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('pharmacy_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  };

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      logout(); // Clear auth before navigating
      navigate('/signin');
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  // Add function to update stock from first batch
  const updateStockFromFirstBatch = async (productId: string, quantity: number) => {
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${API_BASE_URL}/products/${productId}/batch-stock`,
        {
          quantity: -quantity // Negative quantity to reduce stock
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        // Update the local products state with the new stock
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === productId 
              ? { ...product, totalStock: response.data.data.product.totalStock }
              : product
          )
        );

        // Update summary after stock change
        setSummary(prevSummary => ({
          ...prevSummary,
          totalStock: prevSummary.totalStock - quantity,
          totalValue: prevSummary.totalValue - (quantity * (products.find(p => p._id === productId)?.price || 0)),
          lowStockProducts: products.filter(p => (p.totalStock || 0) < 10).length
        }));
      }
    } catch (error) {
      console.error('Error updating product batch stock:', error);
      // Don't throw the error, just log it
    }
  };

  // Modify checkShippedOrdersAndUpdateStock to use batch stock update
  const checkShippedOrdersAndUpdateStock = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          status: 'shipped',
          updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Last 5 minutes
        }
      });

      const shippedOrders = response.data.data.orders;
      let stockChanged = false;
      
      // Update stock for each shipped order
      for (const order of shippedOrders) {
        for (const item of order.items) {
          // Update stock from first batch
          await updateStockFromFirstBatch(item.productId, item.quantity);
          stockChanged = true;
        }
      }

      // If stock changed, refresh the products list
      if (stockChanged) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error checking shipped orders:', error);
    }
  };

  // Modify fetchProducts to include stock updates
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('pharmacy_token');
      
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && Array.isArray(response.data.data.products)) {
        const products = response.data.data.products;
        setProducts(products);
        
        // Calculate summary metrics
        const summaryData: Summary = {
          totalProducts: products.length,
          totalStock: products.reduce((sum: number, product: Product) => sum + (product.totalStock || 0), 0),
          totalValue: products.reduce((sum: number, product: Product) => sum + ((product.totalStock || 0) * product.price), 0),
          lowStockProducts: products.filter((product: Product) => (product.totalStock || 0) < 10).length
        };
        setSummary(summaryData);
        
        // Log total remaining stock for each product
        products.forEach((product: Product) => {
          console.log(`Product: ${product.name}`);
          console.log(`Total Stock: ${product.totalStock || 0}`);
          console.log(`Remaining Stock: ${product.totalStock || 0}`);
          console.log('------------------------');
        });
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add interval to check for shipped orders and update stock
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
      // Check for shipped orders every minute
      const interval = setInterval(checkShippedOrdersAndUpdateStock, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdmin]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setValidationErrors([]);
      const token = getAuthToken();
      const formData = new FormData();
      
      // Validate required fields
      if (!newProduct.name || !newProduct.brand || !newProduct.category || 
          !newProduct.description || !newProduct.price || !mainImage) {
        const errors: ValidationError[] = [];
        if (!newProduct.name) errors.push({ field: 'name', message: 'Name is required' });
        if (!newProduct.brand) errors.push({ field: 'brand', message: 'Brand is required' });
        if (!newProduct.category) errors.push({ field: 'category', message: 'Category is required' });
        if (!newProduct.description) errors.push({ field: 'description', message: 'Description is required' });
        if (!newProduct.price) errors.push({ field: 'price', message: 'Price is required' });
        if (!mainImage) errors.push({ field: 'mainImage', message: 'Main image is required' });
        setValidationErrors(errors);
        return;
      }

      // Append all form fields
      formData.append('name', newProduct.name);
      formData.append('brand', newProduct.brand);
      formData.append('category', newProduct.category);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price.toString());

      // Append main image
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }

      // Append sub images if any
      if (subImages.length > 0) {
        subImages.forEach((image) => {
          formData.append('subImages', image);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          brand: '',
          category: '',
          description: '',
          price: undefined
        });
        setMainImage(null);
        setSubImages([]);
        fetchProducts();
      }
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage?.includes('validation failed')) {
          const validationErrors = errorMessage
            .replace('Product validation failed: ', '')
            .split(', ')
            .map((err: string) => {
              const [field, message] = err.split(': ');
              return {
                field: field.replace('Path `', '').replace('`', ''),
                message: message.replace('.', '')
              };
            });
          setValidationErrors(validationErrors);
        } else {
          setError(errorMessage || 'Error adding product');
        }
      }
    }
  };

  // Handle edit product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setError(null);
      const token = getAuthToken();
      const formData = new FormData();
      
      // Validate required fields
      if (!editedProduct.name || !editedProduct.brand || !editedProduct.category || 
          !editedProduct.description || !editedProduct.price) {
        setError('Please fill in all required fields');
        return;
      }

      formData.append('name', editedProduct.name);
      formData.append('brand', editedProduct.brand);
      formData.append('category', editedProduct.category);
      formData.append('description', editedProduct.description);
      formData.append('price', editedProduct.price.toString());
      
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }
      
      subImages.forEach((image) => {
        formData.append('subImages', image);
      });

      await axios.patch(`${API_BASE_URL}/products/${selectedProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setIsEditModalOpen(false);
      setEditedProduct({
        name: '',
        brand: '',
        category: '',
        description: '',
        price: undefined
      });
      setMainImage(null);
      setSubImages([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error updating product');
      }
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setError(null);
      const token = getAuthToken();
      await axios.delete(`${API_BASE_URL}/products/${selectedProduct._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  // Modify handleSendLowStockAlert to send restock requests
  const handleSendLowStockAlert = async () => {
    try {
      setLoading(true);
      setAlertStatus({ type: null, message: '' });
      const token = getAuthToken();
      
      // Filter products with low stock (less than 10)
      const lowStockProducts = products.filter((product: Product) => product.totalStock < 10);
      
      if (lowStockProducts.length === 0) {
        setAlertStatus({
          type: 'error',
          message: 'No low stock products found'
        });
        return;
      }

      // Prepare products data with only necessary fields
      const productsData = lowStockProducts.map(product => ({
        _id: product._id,
        name: product.name,
        totalStock: product.totalStock,
        brand: product.brand,
        category: product.category
      }));

      // Send restock request
      const response = await axios.post(
        `${API_BASE_URL}/products/restock-request`,
        { products: productsData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        // Check if email was sent successfully
        if (response.data.data.emailSent) {
          setAlertStatus({
            type: 'success',
            message: `Restock request sent for ${lowStockProducts.length} products`
          });
        } else {
          setAlertStatus({
            type: 'warning',
            message: `Restock request processed for ${lowStockProducts.length} products, but email could not be sent. Please check email configuration.`
          });
          console.error('Email sending failed:', response.data.data.emailError);
        }
      } else {
        throw new Error(response.data.message || 'Failed to send restock request');
      }
    } catch (error) {
      console.error('Error sending restock request:', error);
      setAlertStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send restock request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Products Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Stock Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalStock}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">Rs {summary.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Products Card with Alert Button */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Products</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.lowStockProducts}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Tag className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          {summary.lowStockProducts > 0 && (
            <button
              onClick={handleSendLowStockAlert}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              disabled={loading}
            >
              <AlertTriangle size={18} />
              {loading ? 'Sending...' : 'Send Alert'}
            </button>
          )}
        </div>
      </div>

      {/* Alert Status Message */}
      {alertStatus.type && (
        <div className={`mb-4 p-4 rounded-md ${
          alertStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {alertStatus.message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc list-inside">
            {validationErrors.map((err, index) => (
              <li key={index}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading...
        </div>
      )}
      
      {/* Filters and Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="medicine">Medicine</option>
            <option value="supplements">Supplements</option>
            <option value="equipment">Equipment</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {Array.from(new Set(products.map(p => p.brand))).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`http://localhost:5000/uploads/${product.mainImage}`}
                    alt={product.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 max-w-xs truncate">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.totalStock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setEditedProduct(product);
                      setIsEditModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                      validationErrors.some(err => err.field === 'name') 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand *</label>
                  <input
                    type="text"
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                      validationErrors.some(err => err.field === 'brand') 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                      validationErrors.some(err => err.field === 'category') 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="medicine">Medicine</option>
                    <option value="supplements">Supplements</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price *</label>
                  <input
                    type="number"
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                      validationErrors.some(err => err.field === 'price') 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Main Image *</label>
                  <input
                    type="file"
                    className={`mt-1 block w-full ${
                      validationErrors.some(err => err.field === 'mainImage') 
                        ? 'border-red-500' 
                        : ''
                    }`}
                    onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                    accept="image/*"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub Images (up to 5)</label>
                  <input
                    type="file"
                    className="mt-1 block w-full"
                    onChange={(e) => setSubImages(Array.from(e.target.files || []))}
                    accept="image/*"
                    multiple
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                      validationErrors.some(err => err.field === 'description') 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setValidationErrors([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedProduct.name || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedProduct.brand || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedProduct.category || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="medicine">Medicine</option>
                    <option value="supplements">Supplements</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Main Image</label>
                  <input
                    type="file"
                    className="mt-1 block w-full"
                    onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                    accept="image/*"
                  />
                  {!mainImage && (
                    <img
                      src={`http://localhost:5000/uploads/${selectedProduct.mainImage}`}
                      alt="Current main image"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub Images (up to 5)</label>
                  <input
                    type="file"
                    className="mt-1 block w-full"
                    onChange={(e) => setSubImages(Array.from(e.target.files || []))}
                    accept="image/*"
                    multiple
                  />
                  {!subImages.length && selectedProduct.subImages && (
                    <div className="mt-2 flex gap-2">
                      {selectedProduct.subImages.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000/uploads/${image}`}
                          alt={`Sub image ${index + 1}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedProduct.description || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the product "{selectedProduct.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;