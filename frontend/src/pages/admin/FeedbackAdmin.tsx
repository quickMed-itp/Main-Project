import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface Feedback {
  _id: string;
  name: string;
  email: string;
  feedback: string;
  rating: number;
  productId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
}

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);

  // Fetch all products for filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/products');
        setProducts(res.data.data.products);
      } catch {
        // ignore
      }
    };
    fetchProducts();
  }, []);

  // Fetch feedbacks (optionally by product)
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('pharmacy_token');
        let url = '/feedback';
        if (productFilter) {
          url += `?productId=${productFilter}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedbacks(res.data.data.feedbacks);
      } catch {
        setError('Failed to fetch feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [productFilter]);

  // Filtered feedbacks
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch =
      fb.name.toLowerCase().includes(search.toLowerCase()) ||
      fb.feedback.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter ? fb.rating === Number(ratingFilter) : true;
    return matchesSearch && matchesRating;
  });

  // Get product name by id
  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown';
  };

  // Delete feedback (with confirmation modal)
  const handleDelete = (fb: Feedback) => {
    setFeedbackToDelete(fb);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      const token = localStorage.getItem('pharmacy_token');
      await axios.delete(`/feedback/${feedbackToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(fbs => fbs.filter(fb => fb._id !== feedbackToDelete._id));
      setDeleteModalOpen(false);
      setFeedbackToDelete(null);
    } catch {
      setError('Failed to delete feedback');
    }
  };

  // Approve/Reject feedback
  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('pharmacy_token');
      await axios.patch(`/feedback/${id}/${status === 'approved' ? 'approve' : 'reject'}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(fbs =>
        fbs.map(fb =>
          fb._id === id ? { ...fb, status } : fb
        )
      );
      setModalOpen(false);
      setSelectedFeedback(null);
    } catch {
      setError(`Failed to ${status} feedback`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Search feedback..."
            className="border border-gray-300 rounded-md p-2 flex-1 min-w-[200px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md p-2"
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-md p-2 min-w-[180px]"
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedbacks.map(fb => (
                  <tr key={fb._id} className="hover:bg-gray-100 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedFeedback(fb); setModalOpen(true); }}>{fb.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedFeedback(fb); setModalOpen(true); }}>{getProductName(fb.productId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" onClick={() => { setSelectedFeedback(fb); setModalOpen(true); }}>{fb.feedback.length > 40 ? fb.feedback.slice(0, 40) + '...' : fb.feedback}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedFeedback(fb); setModalOpen(true); }}>{fb.rating}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedFeedback(fb); setModalOpen(true); }}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fb.status === 'approved' ? 'bg-green-100 text-green-800' : fb.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{fb.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={e => { e.stopPropagation(); handleDelete(fb); }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal for full feedback */}
      {modalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-4 right-4" onClick={() => setModalOpen(false)}><X size={24} /></button>
            <h2 className="text-xl font-semibold mb-2">Feedback from {selectedFeedback.name}</h2>
            <div className="mb-2 text-gray-600">Product: {getProductName(selectedFeedback.productId)}</div>
            <div className="mb-2 text-gray-600">Email: {selectedFeedback.email}</div>
            <div className="mb-2">Rating: <span className="font-bold">{selectedFeedback.rating}</span></div>
            <div className="mb-4 whitespace-pre-line">{selectedFeedback.feedback}</div>
            <div className="flex justify-end gap-3">
              {selectedFeedback.status !== 'approved' && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleStatus(selectedFeedback._id, 'approved')}
                >Approve</button>
              )}
              {selectedFeedback.status !== 'rejected' && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleStatus(selectedFeedback._id, 'rejected')}
                >Reject</button>
              )}
              <button
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => setModalOpen(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && feedbackToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this feedback from <span className="font-semibold">{feedbackToDelete.name}</span> about <span className="font-semibold">{getProductName(feedbackToDelete.productId)}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setDeleteModalOpen(false); setFeedbackToDelete(null); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

export default FeedbackAdmin;