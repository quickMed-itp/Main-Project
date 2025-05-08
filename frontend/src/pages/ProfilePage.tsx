import React from 'react';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="mt-1 text-gray-900">John Doe</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-gray-900">john.doe@example.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="mt-1 text-gray-900">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Street Address</label>
                <p className="mt-1 text-gray-900">123 Main Street</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">City, State</label>
                <p className="mt-1 text-gray-900">New York, NY</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">ZIP Code</label>
                <p className="mt-1 text-gray-900">10001</p>
              </div>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default ProfilePage;