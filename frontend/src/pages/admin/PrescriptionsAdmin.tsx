import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, CheckCircle, XCircle, FileText, TrendingUp, Users } from 'lucide-react';

interface Prescription {
  _id: string;
  patientName: string;
  patientAge: number;
  filePaths: string[];
  fileUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  filePath?: string;
}

const PrescriptionsAdmin = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortField, setSortField] = useState<'date' | 'name' | 'age'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    todayCount: 0,
    averageResponseTime: 0,
    recentActivity: [] as { type: string; count: number; date: string }[]
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('pharmacy_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      logout();
      navigate('/signin');
    }
    // eslint-disable-next-line
  }, [isAuthenticated, isAdmin, navigate, logout]);

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/prescriptions/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPrescriptions(response.data.data.prescriptions);
    } catch (error: unknown) {
      console.error('Error fetching prescriptions:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error fetching prescriptions');
        if (error.response?.status === 401) {
          logout();
          navigate('/signin');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchPrescriptions();
    }
  }, [isAuthenticated, isAdmin, fetchPrescriptions]);

  // Handle prescription status update
  const handleStatusUpdate = async (prescriptionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      setError(null);
      const token = getAuthToken();
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/prescriptions/${prescriptionId}/status`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchPrescriptions(); // Refresh the list
    } catch (error: unknown) {
      console.error('Error updating prescription status:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error updating prescription status');
      }
    }
  };

  // New function to handle search and filtering
  const getFilteredPrescriptions = useCallback(() => {
    let filtered = [...prescriptions];
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.patientName.toLowerCase().includes(searchLower) ||
        p._id.toLowerCase().includes(searchLower)
      );
    }
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'age':
          comparison = a.patientAge - b.patientAge;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [prescriptions, searchTerm, statusFilter, sortField, sortDirection]);

  // Calculate statistics
  useEffect(() => {
    if (prescriptions.length > 0) {
      const today = new Date().toDateString();
      const todayPrescriptions = prescriptions.filter(p =>
        new Date(p.createdAt).toDateString() === today
      );
      // Calculate average response time (time between creation and status update)
      const responseTimes = prescriptions
        .filter(p => p.status !== 'pending')
        .map(p => {
          const created = new Date(p.createdAt).getTime();
          const updated = new Date(p.updatedAt).getTime();
          return updated - created;
        });
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;
      // Get recent activity (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
      }).reverse();
      const recentActivity = last7Days.map(date => ({
        type: 'prescriptions',
        count: prescriptions.filter(p =>
          new Date(p.createdAt).toDateString() === date
        ).length,
        date
      }));
      setStats({
        total: prescriptions.length,
        pending: prescriptions.filter(p => p.status === 'pending').length,
        approved: prescriptions.filter(p => p.status === 'approved').length,
        rejected: prescriptions.filter(p => p.status === 'rejected').length,
        todayCount: todayPrescriptions.length,
        averageResponseTime: avgResponseTime,
        recentActivity
      });
    }
  }, [prescriptions]);

  // Format time duration
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Get filtered prescriptions
  const filteredPrescriptions = getFilteredPrescriptions();
  const pendingPrescriptions = filteredPrescriptions.filter(p => p.status === 'pending');
  const historyPrescriptions = filteredPrescriptions.filter(p => p.status !== 'pending');

  return (
    <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-teal-800 bg-white/80 backdrop-blur-sm py-4 rounded-2xl shadow-lg">Prescriptions Management</h1>
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Prescriptions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Prescriptions</p>
              <h3 className="text-3xl font-bold text-teal-800 mt-1">{stats.total}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <FileText className="text-teal-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-teal-500">
            <TrendingUp size={16} className="mr-1" />
            <span>{stats.todayCount} new today</span>
          </div>
        </div>

        {/* Pending Prescriptions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Pending</p>
              <h3 className="text-3xl font-bold text-teal-800 mt-1">{stats.pending}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <Clock className="text-teal-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-teal-500">
            <span>Awaiting review</span>
          </div>
        </div>

        {/* Approved Prescriptions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Approved</p>
              <h3 className="text-3xl font-bold text-teal-800 mt-1">{stats.approved}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <CheckCircle className="text-teal-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-teal-500">
            <span>Successfully processed</span>
          </div>
        </div>

        {/* Rejected Prescriptions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Rejected</p>
              <h3 className="text-3xl font-bold text-teal-800 mt-1">{stats.rejected}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <XCircle className="text-teal-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-teal-500">
            <span>Not approved</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100 mb-8">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Recent Activity</h2>
        <div className="flex items-end h-32 gap-2">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-teal-200 rounded-t-lg transition-all duration-300 hover:bg-teal-300"
                style={{ 
                  height: `${Math.max(10, (activity.count / Math.max(...stats.recentActivity.map(a => a.count))) * 100)}%`
                }}
              />
              <span className="text-xs text-teal-600 mt-2">
                {new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Response Time</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-teal-800">
                {formatDuration(stats.averageResponseTime)}
              </p>
              <p className="text-teal-600 text-sm mt-1">Average response time</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <Clock className="text-teal-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Patient Statistics</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-teal-800">
                {new Set(prescriptions.map(p => p.patientName)).size}
              </p>
              <p className="text-teal-600 text-sm mt-1">Unique patients</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-xl">
              <Users className="text-teal-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 text-teal-400" size={20} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-xl border border-teal-200 hover:bg-teal-50 transition-all duration-200"
          >
            <Filter size={20} />
            Filter
          </button>
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as 'date' | 'name' | 'age');
              setSortDirection(direction as 'asc' | 'desc');
            }}
            className="px-4 py-2 bg-white text-teal-600 rounded-xl border border-teal-200 hover:bg-teal-50 transition-all duration-200"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="age-asc">Age Low-High</option>
            <option value="age-desc">Age High-Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl transform transition-all duration-300 hover:scale-[1.02] shadow-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl transform transition-all duration-300 hover:scale-[1.02] shadow-md">
          Loading...
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Pending Prescriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-b">
                    <td className="px-4 py-3">#{prescription._id.slice(-6)}</td>
                    <td className="px-4 py-3">{prescription.patientName}</td>
                    <td className="px-4 py-3">{prescription.patientAge}</td>
                    <td className="px-4 py-3">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Pending
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Prescription History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-b">
                    <td className="px-4 py-3">#{prescription._id.slice(-6)}</td>
                    <td className="px-4 py-3">{prescription.patientName}</td>
                    <td className="px-4 py-3">{prescription.patientAge}</td>
                    <td className="px-4 py-3">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        prescription.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Prescription Modal */}
      {isViewModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-15 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Prescription Details</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Patient Information</h3>
                <p>Name: {selectedPrescription.patientName}</p>
                <p>Age: {selectedPrescription.patientAge}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Prescription Images</h3>
                <div className="mt-2 space-y-4 max-h-72 overflow-y-auto pr-2">
                  {selectedPrescription.filePaths && selectedPrescription.filePaths.length > 0 ? (
                    selectedPrescription.filePaths.map((filePath, index) => (
                      <div key={index} className="border rounded-lg p-2">
                        <img
                          src={`http://localhost:5000/${filePath.replace(/\\/g, '/').replace(/\\/g, '/')}`}
                          alt={`Prescription ${index + 1}`}
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No prescription images available
                    </div>
                  )}
                </div>
              </div>
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-medium text-gray-700">Notes</h3>
                  <p>{selectedPrescription.notes}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-700">Status</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  selectedPrescription.status === 'approved' 
                    ? 'bg-teal-100 text-teal-800'
                    : selectedPrescription.status === 'rejected'
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  {selectedPrescription.status}
                </span>
              </div>
              {selectedPrescription.status === 'pending' && (
                <div className="flex justify-center space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPrescription._id, 'rejected');
                      setIsViewModalOpen(false);
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPrescription._id, 'approved');
                      setIsViewModalOpen(false);
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-teal-800">Filter Prescriptions</h2>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-teal-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                  className="w-full px-4 py-2 rounded-xl border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-teal-100">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setIsFilterModalOpen(false);
                  }}
                  className="px-4 py-2 text-teal-600 hover:bg-teal-50 transition-all duration-200"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsAdmin;