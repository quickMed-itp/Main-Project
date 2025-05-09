import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UploadPrescriptionPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validatePatientName = (name: string) => {
    if (!name.trim()) {
      return 'Patient name is required';
    }
    if (name.length < 2) {
      return 'Patient name must be at least 2 characters long';
    }
    if (name.length > 50) {
      return 'Patient name must be less than 50 characters';
    }
    return null;
  };

  const validatePatientAge = (age: string) => {
    if (!age) {
      return 'Patient age is required';
    }
    const numAge = parseInt(age);
    if (isNaN(numAge)) {
      return 'Age must be a valid number';
    }
    if (numAge < 0 || numAge > 150) {
      return 'Age must be between 0 and 150';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientName(e.target.value);
    setError(null);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientAge(e.target.value);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError('One or more files exceed 5MB limit');
        return false;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError('One or more files exceed 5MB limit');
        return false;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF');
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nameError = validatePatientName(patientName);
    const ageError = validatePatientAge(patientAge);

    if (nameError) {
      setError(nameError);
      return;
    }

    if (ageError) {
      setError(ageError);
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one prescription file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('prescription', file);
      });

      formData.append('patientName', patientName.trim());
      formData.append('patientAge', patientAge);

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/prescriptions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        setSuccess('Prescriptions uploaded successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to upload prescriptions');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(`Failed to upload prescriptions: ${errorMessage}`);
        console.error('Upload error:', err.response?.data);
      } else {
        setError('An unexpected error occurred while uploading the prescriptions');
        console.error('Unexpected error:', err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">Upload Prescription</h1>
       
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-indigo-100">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient Information Section */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-name" className="block text-sm font-medium text-indigo-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="patient-name"
                  value={patientName}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <label htmlFor="patient-age" className="block text-sm font-medium text-indigo-700 mb-1">
                  Patient Age *
                </label>
                <input
                  type="number"
                  id="patient-age"
                  value={patientAge}
                  onChange={handleAgeChange}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter patient age"
                  min="0"
                  max="150"
                  required
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Upload Prescription</h3>
            <div
              className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors duration-300"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-indigo-500 mb-4" />
                <p className="text-indigo-600 mb-2">
                  Drag and drop your prescription files here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, PDF (Max 5MB each)
                </p>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-indigo-700 mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg"
                    >
                      <span className="text-indigo-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading}
              className={`px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPrescriptionPage;