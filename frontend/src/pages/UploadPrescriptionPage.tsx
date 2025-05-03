import React from 'react';
import { Upload } from 'lucide-react';

const UploadPrescriptionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Prescription</h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
          />
          <label
            htmlFor="prescription-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Choose File
          </label>
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
      </div>
    </div>
  );
};

export default UploadPrescriptionPage;