import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Plus, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/useAuth';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // Important for cookies/sessions

// Add request interceptor to include token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmacy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('pharmacy_token');
      localStorage.removeItem('pharmacy_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
}

interface Batch {
  _id: string;
  productId: Product;
  supplierId: Supplier;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  remainingQuantity: number;
  costPrice: number;
  sellingPrice: number;
  status: 'active' | 'expired' | 'depleted';
  createdAt: string;
  updatedAt: string;
}

interface BatchResponse {
  status: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    batches: Batch[];
  };
}

interface FormErrors {
  productId?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  quantity?: string;
  costPrice?: string;
  sellingPrice?: string;
  supplierId?: string;
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const InventoryAdmin = () => {
  const { logout } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [newBatch, setNewBatch] = useState<Partial<Batch>>({});
  const [editedBatch, setEditedBatch] = useState<Partial<Batch>>({});
  const [summary, setSummary] = useState({
    totalBatches: 0,
    activeBatches: 0,
    expiringBatches: 0,
    totalValue: 0
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [addFormErrors, setAddFormErrors] = useState<FormErrors>({});
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});

  // Fetch batches and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [batchesResponse, productsResponse, suppliersResponse] = await Promise.all([
          axios.get<BatchResponse>('/batches'),
          axios.get('/products'),
          axios.get('/suppliers')
        ]);
        const batches = batchesResponse.data.data.batches;
        setBatches(batches);
        setProducts(productsResponse.data.data.products);
        setSuppliers(suppliersResponse.data.data.suppliers);
        setFilteredProducts(productsResponse.data.data.products);

        // Calculate summary metrics
        const now = new Date();
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const summaryData = {
          totalBatches: batches.length,
          activeBatches: batches.filter(b => b.status === 'active').length,
          expiringBatches: batches.filter(b => 
            b.status === 'active' && new Date(b.expiryDate) <= sevenDaysFromNow
          ).length,
          totalValue: batches.reduce((sum, batch) => 
            sum + (batch.quantity * batch.costPrice), 0
          )
        };
        setSummary(summaryData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch data';
          console.error('Error fetching data:', errorMessage);
          if (error.response?.status === 401) {
            logout();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [logout]);

  // Filter batches based on search and status
  const filteredBatches = batches.filter(batch => {
    const productName = batch.productId?.name?.toLowerCase() || '';
    const batchNumber = batch.batchNumber?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      productName.includes(searchTermLower) ||
      batchNumber.includes(searchTermLower);
    const matchesStatus = !selectedStatus || batch.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filter products based on search term
  useEffect(() => {
    if (productSearchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearchTerm, products]);

  // Function to calculate summary metrics
  const calculateSummary = (batchesList: Batch[]) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return {
      totalBatches: batchesList.length,
      activeBatches: batchesList.filter(b => b.status === 'active').length,
      expiringBatches: batchesList.filter(b => 
        b.status === 'active' && new Date(b.expiryDate) <= sevenDaysFromNow
      ).length,
      totalValue: batchesList.reduce((sum, batch) => 
        sum + (batch.remainingQuantity * batch.costPrice), 0
      )
    };
  };

  // Update summary whenever batches change
  useEffect(() => {
    setSummary(calculateSummary(batches));
  }, [batches]);

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Generate batch number
  const generateBatchNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BATCH-${timestamp}-${random}`;
  };

  const validateBatchForm = (formData: Partial<Batch>): FormErrors => {
    const errors: FormErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.productId) {
      errors.productId = 'Product is required';
    }

    if (!formData.manufacturingDate) {
      errors.manufacturingDate = 'Manufacturing date is required';
    } else {
      const mfgDate = new Date(formData.manufacturingDate);
      if (mfgDate > today) {
        errors.manufacturingDate = 'Manufacturing date cannot be in the future';
      }
    }

    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else {
      const expDate = new Date(formData.expiryDate);
      if (formData.manufacturingDate && expDate <= new Date(formData.manufacturingDate)) {
        errors.expiryDate = 'Expiry date must be after manufacturing date';
      }
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (formData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.costPrice) {
      errors.costPrice = 'Cost price is required';
    } else if (formData.costPrice < 0.01) {
      errors.costPrice = 'Cost price must be at least 0.01';
    }

    if (!formData.sellingPrice) {
      errors.sellingPrice = 'Selling price is required';
    } else if (formData.sellingPrice < 0.01) {
      errors.sellingPrice = 'Selling price must be at least 0.01';
    } else if (formData.costPrice && formData.sellingPrice < formData.costPrice) {
      errors.sellingPrice = 'Selling price cannot be less than cost price';
    }

    return errors;
  };

  const handleAddBatch = async () => {
    const errors = validateBatchForm(newBatch);
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }

    if (!newBatch.productId || !selectedSupplier) {
      setAddFormErrors({ 
        productId: 'Product is required',
        supplierId: 'Supplier is required'
      });
      return;
    }
    
    try {
      const batchData = {
        ...newBatch,
        batchNumber: generateBatchNumber(),
        supplierId: selectedSupplier._id
      };

      const response = await axios.post('/batches', batchData);
      const newBatchData = response.data.data.batch;
      const product = products.find(p => p._id === newBatchData.productId);
      const supplier = suppliers.find(s => s._id === newBatchData.supplierId);
      const batchWithDetails = {
        ...newBatchData,
        productId: product,
        supplierId: supplier
      };

      // Update batches and summary will be updated via useEffect
      setBatches([batchWithDetails, ...batches]);
      setIsAddBatchModalOpen(false);
      setNewBatch({});
      setSelectedSupplier(null);
      setProductSearchTerm('');
      setShowProductDropdown(false);
      setAddFormErrors({});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to add batch';
        console.error('Error adding batch:', errorMessage);
        setAddFormErrors({ productId: errorMessage });
      }
    }
  };

  const handleEditBatch = async () => {
    if (!selectedBatch) return;

    const errors = validateBatchForm(editedBatch);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    try {
      const response = await axios.patch(`/batches/${selectedBatch._id}`, {
        supplierId: editedBatch.supplierId?._id,
        manufacturingDate: editedBatch.manufacturingDate,
        expiryDate: editedBatch.expiryDate,
        quantity: editedBatch.quantity,
        costPrice: editedBatch.costPrice,
        sellingPrice: editedBatch.sellingPrice
      });
      
      const updatedBatchData = response.data.data.batch;
      
      // Update batches and summary will be updated via useEffect
      setBatches(batches.map(b => 
        b._id === selectedBatch._id ? updatedBatchData : b
      ));
      setIsEditModalOpen(false);
      setEditedBatch({});
      setEditFormErrors({});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update batch';
        console.error('Error updating batch:', errorMessage);
        setEditFormErrors({ productId: errorMessage });
      }
    }
  };

  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    
    try {
      const response = await axios.delete(`/batches/${selectedBatch._id}`);
      if (response.status === 204) {
        // Update batches and summary will be updated via useEffect
        setBatches(prevBatches => prevBatches.filter(batch => batch._id !== selectedBatch._id));
        setIsDeleteModalOpen(false);
        setSelectedBatch(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to delete batch';
        console.error('Error deleting batch:', errorMessage);
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  // Update the edit form to use formatted dates
  const handleEditClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditedBatch({
      ...batch,
      manufacturingDate: formatDateForInput(batch.manufacturingDate),
      expiryDate: formatDateForInput(batch.expiryDate)
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Batch Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Batches Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalBatches}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Batches Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Batches</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.activeBatches}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.expiringBatches}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
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
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search batches..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>

          <button
            onClick={() => setIsAddBatchModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Batch
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturing Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No batches found
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => (
                <tr key={batch._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{batch.productId.name}</div>
                    <div className="text-sm text-gray-500">{batch.productId.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.batchNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(batch.manufacturingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(batch.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {batch.costPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {batch.sellingPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${batch.status === 'active' ? 'bg-green-100 text-green-800' : 
                        batch.status === 'expired' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        handleEditClick(batch);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBatch(batch);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Batch Modal */}
      {isAddBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Batch</h2>
              <button onClick={() => {
                setIsAddBatchModalOpen(false);
                setSelectedSupplier(null);
                setProductSearchTerm('');
                setShowProductDropdown(false);
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddBatch(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    className={`mt-1 block w-full border ${addFormErrors.productId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={selectedSupplier?._id || ''}
                    onChange={(e) => {
                      const supplier = suppliers.find(s => s._id === e.target.value);
                      setSelectedSupplier(supplier || null);
                      setAddFormErrors({ ...addFormErrors, productId: undefined });
                    }}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {addFormErrors.productId && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.productId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`mt-1 block w-full border ${addFormErrors.productId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowProductDropdown(true);
                        setAddFormErrors({ ...addFormErrors, productId: undefined });
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                    />
                    {showProductDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500">No products found</div>
                        ) : (
                          filteredProducts.map(product => (
                            <div
                              key={product._id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewBatch({ ...newBatch, productId: product });
                                setProductSearchTerm(product.name);
                                setShowProductDropdown(false);
                              }}
                            >
                              {product.name} - {product.brand}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <input
                    type="date"
                    className={`mt-1 block w-full border ${addFormErrors.manufacturingDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={newBatch.manufacturingDate || ''}
                    onChange={(e) => {
                      setNewBatch({ ...newBatch, manufacturingDate: e.target.value });
                      setAddFormErrors({ ...addFormErrors, manufacturingDate: undefined });
                    }}
                    required
                  />
                  {addFormErrors.manufacturingDate && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.manufacturingDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    className={`mt-1 block w-full border ${addFormErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={newBatch.expiryDate || ''}
                    onChange={(e) => {
                      setNewBatch({ ...newBatch, expiryDate: e.target.value });
                      setAddFormErrors({ ...addFormErrors, expiryDate: undefined });
                    }}
                    required
                  />
                  {addFormErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    className={`mt-1 block w-full border ${addFormErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={newBatch.quantity || ''}
                    onChange={(e) => {
                      setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) });
                      setAddFormErrors({ ...addFormErrors, quantity: undefined });
                    }}
                    required
                  />
                  {addFormErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`mt-1 block w-full border ${addFormErrors.costPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={newBatch.costPrice || ''}
                    onChange={(e) => {
                      setNewBatch({ ...newBatch, costPrice: parseFloat(e.target.value) });
                      setAddFormErrors({ ...addFormErrors, costPrice: undefined });
                    }}
                    required
                  />
                  {addFormErrors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.costPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`mt-1 block w-full border ${addFormErrors.sellingPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={newBatch.sellingPrice || ''}
                    onChange={(e) => {
                      setNewBatch({ ...newBatch, sellingPrice: parseFloat(e.target.value) });
                      setAddFormErrors({ ...addFormErrors, sellingPrice: undefined });
                    }}
                    required
                  />
                  {addFormErrors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.sellingPrice}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBatchModalOpen(false);
                    setSelectedSupplier(null);
                    setProductSearchTerm('');
                    setShowProductDropdown(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Batch</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditBatch(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    className={`mt-1 block w-full border ${editFormErrors.supplierId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.supplierId?._id || ''}
                    onChange={(e) => {
                      const supplier = suppliers.find(s => s._id === e.target.value);
                      setEditedBatch({ ...editedBatch, supplierId: supplier });
                      setEditFormErrors({ ...editFormErrors, supplierId: undefined });
                    }}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.supplierId && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.supplierId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900">{editedBatch.productId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{editedBatch.productId?.brand || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <input
                    type="date"
                    className={`mt-1 block w-full border ${editFormErrors.manufacturingDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.manufacturingDate || ''}
                    onChange={(e) => {
                      setEditedBatch({ ...editedBatch, manufacturingDate: e.target.value });
                      setEditFormErrors({ ...editFormErrors, manufacturingDate: undefined });
                    }}
                    required
                  />
                  {editFormErrors.manufacturingDate && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.manufacturingDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    className={`mt-1 block w-full border ${editFormErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.expiryDate || ''}
                    onChange={(e) => {
                      setEditedBatch({ ...editedBatch, expiryDate: e.target.value });
                      setEditFormErrors({ ...editFormErrors, expiryDate: undefined });
                    }}
                    required
                  />
                  {editFormErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    className={`mt-1 block w-full border ${editFormErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.quantity || ''}
                    onChange={(e) => {
                      setEditedBatch({ ...editedBatch, quantity: parseInt(e.target.value) });
                      setEditFormErrors({ ...editFormErrors, quantity: undefined });
                    }}
                    required
                  />
                  {editFormErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`mt-1 block w-full border ${editFormErrors.costPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.costPrice || ''}
                    onChange={(e) => {
                      setEditedBatch({ ...editedBatch, costPrice: parseFloat(e.target.value) });
                      setEditFormErrors({ ...editFormErrors, costPrice: undefined });
                    }}
                    required
                  />
                  {editFormErrors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.costPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`mt-1 block w-full border ${editFormErrors.sellingPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    value={editedBatch.sellingPrice || ''}
                    onChange={(e) => {
                      setEditedBatch({ ...editedBatch, sellingPrice: parseFloat(e.target.value) });
                      setEditFormErrors({ ...editFormErrors, sellingPrice: undefined });
                    }}
                    required
                  />
                  {editFormErrors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.sellingPrice}</p>
                  )}
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
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this batch? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
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

export default InventoryAdmin;