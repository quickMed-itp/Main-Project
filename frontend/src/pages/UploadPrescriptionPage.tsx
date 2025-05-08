import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const UploadPrescriptionPage = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5MB limit');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5MB limit');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!patientName || !patientAge) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedFile) {
      setError('Please select a prescription file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);

      const response = await axios.post('http://localhost:5000/api/v1/prescriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true // This is important for sending cookies
      });

      if (response.data.status === 'success') {
        setSuccess('Prescription uploaded successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to upload prescription');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(`Failed to upload prescription: ${errorMessage}`);
        console.error('Upload error:', err.response?.data);
      } else {
        setError('An unexpected error occurred while uploading the prescription');
        console.error('Unexpected error:', err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Prescription</h1>
       
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <label htmlFor="patient-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Age *
                </label>
                <input
                  type="number"
                  id="patient-age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient age"
                  min="0"
                  max="120"
                  required
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload your prescription</h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your prescription file here, or click to select a file
            </p>
            <input
              type="file"
              className="hidden"
              id="prescription-upload"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <label
              htmlFor="prescription-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Choose File
            </label>
            {selectedFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected file: {selectedFile.name}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: JPG, PNG, PDF (Max size: 5MB)
            </p>
          </div>

          <div className="mt-8">
            <h4 className="font-semibold mb-4">Important Notes:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Ensure the prescription is clearly visible and readable</li>
              <li>Include all pages of the prescription</li>
              <li>Make sure the doctor's signature is visible</li>
              <li>Prescriptions must be valid and not expired</li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isUploading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
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