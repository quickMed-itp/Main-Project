import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Plus } from 'lucide-react';
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

interface Product {
  _id: string;
  name: string;
  brand: string;
}

interface Batch {
  _id: string;
  productId: Product;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
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

  // Fetch batches and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [batchesResponse, productsResponse] = await Promise.all([
          axios.get<BatchResponse>('/batches'),
          axios.get('/products')
        ]);
        setBatches(batchesResponse.data.data.batches);
        setProducts(productsResponse.data.data.products);
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

  const handleAddBatch = async () => {
    if (!newBatch.batchNumber) return;
    
    try {
      const response = await axios.post('/batches', newBatch);
      const newBatchData = response.data.data.batch;
      // Try to populate productId from products array
      const product = products.find(p => p._id === newBatchData.productId);
      const batchWithProduct = product
        ? { ...newBatchData, productId: product }
        : newBatchData;

      setBatches([batchWithProduct, ...batches]);
      setIsAddBatchModalOpen(false);
      setNewBatch({});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding batch:', error.response?.data?.message || 'Failed to add batch');
      }
    }
  };

  const handleEditBatch = async () => {
    if (!selectedBatch || !editedBatch.batchNumber) return;
    
    try {
      const response = await axios.patch(`/batches/${selectedBatch._id}`, editedBatch);
      const updatedBatchData = response.data.data.batch;
      const product = products.find(p => p._id === updatedBatchData.productId);
      const batchWithProduct = product
        ? { ...updatedBatchData, productId: product }
        : updatedBatchData;

      setBatches(batches.map(b => 
        b._id === selectedBatch._id ? batchWithProduct : b
      ));
      setIsEditModalOpen(false);
      setEditedBatch({});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update batch';
        console.error('Error updating batch:', errorMessage);
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    
    try {
      const response = await axios.delete(`/batches/${selectedBatch._id}`);
      if (response.status === 204) {
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${batch.costPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${batch.sellingPrice}</td>
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
              <button onClick={() => setIsAddBatchModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddBatch(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.productId?._id || ''}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p._id === e.target.value);
                      setNewBatch({ ...newBatch, productId: selectedProduct });
                    }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {product.brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.batchNumber || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.manufacturingDate || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturingDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.expiryDate || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.quantity || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.costPrice || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, costPrice: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newBatch.sellingPrice || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, sellingPrice: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddBatchModalOpen(false)}
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
                  <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.batchNumber || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, batchNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.manufacturingDate || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, manufacturingDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.expiryDate || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.quantity || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.costPrice || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, costPrice: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editedBatch.sellingPrice || ''}
                    onChange={(e) => setEditedBatch({ ...editedBatch, sellingPrice: parseFloat(e.target.value) })}
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