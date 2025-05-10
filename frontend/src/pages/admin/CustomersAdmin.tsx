import React, { useState, useEffect } from 'react';
import { Search, Trash2, AlertTriangle, UserPlus } from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  role: string;
  status: string;
}

type UserRole = 'user' | 'doctor' | 'pharmacy' | 'admin';

const CustomersAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole>('user');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string | null }>({
    show: false,
    userId: null
  });
  const [roleChangeModal, setRoleChangeModal] = useState<{ 
    show: boolean; 
    userId: string | null;
    currentRole: UserRole | null;
    newRole: UserRole | null;
  }>({
    show: false,
    userId: null,
    currentRole: null,
    newRole: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      if (response.data?.data?.users) {
        setUsers(response.data.data.users);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${userId}/status`, {
        status: newStatus
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${userId}/role`, {
        role: newRole
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      setRoleChangeModal({ show: false, userId: null, currentRole: null, newRole: null });
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setDeleteConfirm({ show: false, userId: null });
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.role === activeTab &&
      ((user.name?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.phone || '').includes(searchTerm))
    );
  });

  const tabs: { id: UserRole; label: string }[] = [
    { id: 'user', label: 'Customers' },
    { id: 'doctor', label: 'Doctors' },
    { id: 'pharmacy', label: 'Pharmacists' },
    { id: 'admin', label: 'Admins' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab}s by name, email, or phone...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Tabs - Centered */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex justify-center space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No {activeTab}s found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.age || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status || 'active'}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (user.status || 'active') === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            const currentUser = users.find(u => u._id === user._id);
                            setRoleChangeModal({ 
                              show: true, 
                              userId: user._id,
                              currentRole: currentUser?.role as UserRole,
                              newRole: currentUser?.role as UserRole
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Change Role"
                        >
                          <UserPlus size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, userId: user._id })}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {roleChangeModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur-sm z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-xl bg-gradient-to-br from-white to-blue-50">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Change User Role
              </h3>
              <div className="w-full mb-6">
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={roleChangeModal.newRole || ''}
                  onChange={(e) => setRoleChangeModal(prev => ({
                    ...prev,
                    newRole: e.target.value as UserRole
                  }))}
                >
                  {tabs.map(tab => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setRoleChangeModal({ show: false, userId: null, currentRole: null, newRole: null })}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (roleChangeModal.userId && roleChangeModal.newRole) {
                      handleRoleChange(roleChangeModal.userId, roleChangeModal.newRole);
                    }
                  }}
                  disabled={!roleChangeModal.newRole || roleChangeModal.newRole === roleChangeModal.currentRole}
                  className={`px-6 py-2 text-sm font-semibold text-white rounded-lg transition-colors duration-200 ${
                    !roleChangeModal.newRole || roleChangeModal.newRole === roleChangeModal.currentRole
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur-sm z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-xl bg-gradient-to-br from-white to-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {activeTab}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, userId: null })}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm.userId && handleDelete(deleteConfirm.userId)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomersAdmin;