import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

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
}

const PrescriptionsAdmin = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

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
      logout();
      navigate('/signin');
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5000/api/v1/prescriptions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data.data.prescriptions);
      const fetchedPrescriptions = response.data.data.prescriptions;
      setPrescriptions(fetchedPrescriptions);
    } catch (error) {
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
        `http://localhost:5000/api/v1/prescriptions/${prescriptionId}/status`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchPrescriptions(); // Refresh the list
    } catch (error) {
      console.error('Error updating prescription status:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error updating prescription status');
      }
    }
  };

  // Handle prescription deletion
  const handleDelete = async (prescriptionId: string) => {
    try {
      setError(null);
      const token = getAuthToken();
      await axios.delete(
        `http://localhost:5000/api/v1/prescriptions/${prescriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Remove the deleted prescription from the state
      setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
      setIsDeleteModalOpen(false);
      setPrescriptionToDelete(null);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error deleting prescription');
      }
    }
  };

  // Filter prescriptions
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const historyPrescriptions = prescriptions.filter(p => p.status !== 'pending');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Prescriptions Management</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
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
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View ({prescription.filePaths.length} files)
                        </button>
                        <button
                          onClick={() => {
                            setPrescriptionToDelete(prescription);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View ({prescription.filePaths.length} files)
                        </button>
                        <button
                          onClick={() => {
                            setPrescriptionToDelete(prescription);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4">
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
                <div className="mt-2 space-y-4">
                  {selectedPrescription.fileUrls?.map((fileUrl, index) => (
                    <div key={index} className="border rounded-lg p-2">
                      <div className="max-h-[60vh] overflow-y-auto">
                        {fileUrl.toLowerCase().endsWith('.pdf') ? (
                          <iframe
                            src={`http://localhost:5000${fileUrl}`}
                            className="w-full h-[60vh]"
                            title={`Prescription ${index + 1}`}
                          />
                        ) : (
                          <img 
                            src={`http://localhost:5000${fileUrl}`}
                            alt={`Prescription ${index + 1}`}
                            className="w-full h-auto object-contain"
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">File {index + 1}</p>
                    </div>
                  ))}
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
                    ? 'bg-green-100 text-green-800'
                    : selectedPrescription.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedPrescription.status}
                </span>
              </div>
              {selectedPrescription.status === 'pending' && (
                <div className="flex justify-center space-x-4 pt-4 border-t sticky bottom-0 bg-white z-10">
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPrescription._id, 'rejected');
                      setIsViewModalOpen(false);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPrescription._id, 'approved');
                      setIsViewModalOpen(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && prescriptionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the prescription for patient <span className="font-semibold">{prescriptionToDelete.patientName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPrescriptionToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(prescriptionToDelete._id)}
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

export default PrescriptionsAdmin;