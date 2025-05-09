import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_FILES = 3;

const UploadPrescriptionPage = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

    if (!patientName || !patientAge) {
      setError('Please fill in all required fields');
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
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);

      const response = await axios.post('http://localhost:5000/api/v1/prescriptions', formData, {
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
              selectedFiles.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload your prescriptions</h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your prescription files here, or click to select files (up to 3)
            </p>
            <input
              type="file"
              className="hidden"
              id="prescription-upload"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              multiple
            />
            <label
              htmlFor="prescription-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Choose Files
            </label>
            
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: JPG, PNG, PDF (Max size: 5MB per file)
            </p>
          </div>

          <div className="mt-8">
            <h4 className="font-semibold mb-4">Important Notes:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You can upload up to 3 prescription images</li>
              <li>Ensure the prescriptions are clearly visible and readable</li>
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
              {isUploading ? 'Uploading...' : 'Upload Prescriptions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPrescriptionPage;