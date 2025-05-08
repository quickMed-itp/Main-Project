import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/useAuth';
import { User, MapPin, Phone, Mail, GraduationCap, Stethoscope } from 'lucide-react';

interface DoctorProfile {
  name: string;
  specialization: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    position: string;
    hospital: string;
    duration: string;
  }[];
}

const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/doctor/profile');
        setProfile(response.data.data);
        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put('/doctor/profile', formData);
      setProfile(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Doctor Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  value={formData.specialization || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  id="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <User className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                  <p className="text-sm text-gray-500">License: {profile?.licenseNumber}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Stethoscope className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{profile?.specialization}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{profile?.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{profile?.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{profile?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Education</h3>
                <div className="mt-4 space-y-4">
                  {profile?.education.map((edu, index) => (
                    <div key={index} className="flex items-start">
                      <GraduationCap className="h-6 w-6 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-500">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Experience</h3>
                <div className="mt-4 space-y-4">
                  {profile?.experience.map((exp, index) => (
                    <div key={index} className="flex items-start">
                      <Stethoscope className="h-6 w-6 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-500">{exp.hospital}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile; 