import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const UploadPrescriptionPage = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePatientName = (name: string) => {
    if (!name.trim()) {
      return 'Patient name is required';
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return 'Patient name can only contain letters and spaces';
    }
    return null;
  };

  const validatePatientAge = (age: string) => {
    if (!age) {
      return 'Patient age is required';
    }
    const numAge = Number(age);
    if (isNaN(numAge)) {
      return 'Age must be a number';
    }
    if (!Number.isInteger(numAge)) {
      return 'Age must be a whole number';
    }
    if (numAge < 0) {
      return 'Age cannot be negative';
    }
    if (numAge > 150) {
      return 'Age seems to be invalid';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientName(value);
    const error = validatePatientName(value);
    if (error) {
      setError(error);
    } else {
      setError(null);
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientAge(value);
    const error = validatePatientAge(value);
    if (error) {
      setError(error);
    } else {
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5MB limit');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFiles([...selectedFiles, file]);
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

      setSelectedFiles([...selectedFiles, file]);
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
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              selectedFiles.length > 0 
                ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                : 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-16 w-16 text-indigo-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-indigo-700">Upload your prescriptions</h3>
            <p className="text-indigo-600 mb-4">
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
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-md"
            >
              Choose Files
            </label>
            
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <span className="text-sm text-indigo-600 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-indigo-500 mt-4">
              Supported formats: JPG, PNG, PDF (Max size: 5MB per file)
            </p>
          </div>

          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-4 text-purple-700">Important Notes:</h4>
            <ul className="list-disc list-inside text-purple-600 space-y-2">
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
              className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg transform transition-all duration-300 ${
                isUploading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] shadow-lg'
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