import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

interface Support {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  status: 'pending' | 'resolved' | 'rejected';
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

const SupportAdmin = () => {
  const [supportTickets, setSupportTickets] = useState<Support[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Support | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Support | null>(null);

  // Fetch support tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('pharmacy_token');
        const res = await axios.get(`${API_BASE_URL}/support`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSupportTickets(res.data.data.tickets);
      } catch (err) {
        console.error('Error fetching support tickets:', err);
        setError('Failed to fetch support tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = supportTickets.filter(ticket => {
    const fullName = `${ticket.firstName} ${ticket.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      ticket.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Delete ticket
  const handleDelete = (ticket: Support) => {
    setTicketToDelete(ticket);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      const token = localStorage.getItem('pharmacy_token');
      await axios.delete(`${API_BASE_URL}/support/${ticketToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupportTickets(tickets => tickets.filter(t => t._id !== ticketToDelete._id));
      setDeleteModalOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Failed to delete ticket');
    }
  };

  // Update ticket status
  const handleStatus = async (id: string, status: 'resolved' | 'rejected') => {
    try {
      setError(null);
      const token = localStorage.getItem('pharmacy_token');
      
      // Configure axios request
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      };

      const response = await axios.patch(
        `${API_BASE_URL}/support/${id}/status`,
        { status },
        config
      );

      if (response.data.status === 'success') {
        // Update the ticket in the state
        setSupportTickets(tickets =>
          tickets.map(ticket =>
            ticket._id === id ? { ...ticket, status: response.data.data.ticket.status } : ticket
          )
        );
        setModalOpen(false);
        setSelectedTicket(null);
      } else {
        setError('Failed to update ticket status');
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection and try again.');
        } else if (err.response) {
          setError(err.response.data?.message || 'Failed to update ticket status');
        } else {
          setError('Failed to update ticket status. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
            className="border border-gray-300 rounded-md p-2 flex-1 min-w-[200px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md p-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-100 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedTicket(ticket); setModalOpen(true); }}>
                      {ticket.firstName} {ticket.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedTicket(ticket); setModalOpen(true); }}>
                      {ticket.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" onClick={() => { setSelectedTicket(ticket); setModalOpen(true); }}>
                      {ticket.message.length > 40 ? ticket.message.slice(0, 40) + '...' : ticket.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => { setSelectedTicket(ticket); setModalOpen(true); }}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        ticket.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>{ticket.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={e => { e.stopPropagation(); handleDelete(ticket); }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for full ticket */}
      {modalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-4 right-4" onClick={() => setModalOpen(false)}><X size={24} /></button>
            <h2 className="text-xl font-semibold mb-2">
              Support Ticket from {selectedTicket.firstName} {selectedTicket.lastName}
            </h2>
            <div className="mb-2 text-gray-600">Email: {selectedTicket.email}</div>
            <div className="mb-4 whitespace-pre-line">{selectedTicket.message}</div>
            {selectedTicket.reply && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Reply:</h3>
                <p className="whitespace-pre-line">{selectedTicket.reply}</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              {selectedTicket.status !== 'resolved' && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleStatus(selectedTicket._id, 'resolved')}
                >Mark as Resolved</button>
              )}
              {selectedTicket.status !== 'rejected' && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleStatus(selectedTicket._id, 'rejected')}
                >Mark as Rejected</button>
              )}
              <button
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => setModalOpen(false)}
              >Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this support ticket from <span className="font-semibold">
                {ticketToDelete.firstName} {ticketToDelete.lastName}
              </span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setDeleteModalOpen(false); setTicketToDelete(null); }}
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

export default SupportAdmin; 