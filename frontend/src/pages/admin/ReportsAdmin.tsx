import React, { useState } from 'react';
import axios from 'axios';
import { Download, Users, ShoppingCart, FileText, MessageSquare, Package } from 'lucide-react';

const ReportsAdmin = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (reportType: string) => {
    try {
      setLoading(reportType);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/reports/${reportType}`,
        {
          responseType: 'blob',
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('pharmacy_token')}`
          }
        }
      );

      // Create a blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and trigger download
      const fileURL = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `${reportType}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error(`Error downloading ${reportType} report:`, error);
      alert(`Failed to download ${reportType} report. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      type: 'customers',
      title: 'Customer Report',
      description: 'Download a detailed report of all registered customers',
      icon: <Users className="h-6 w-6" />
    },
    {
      type: 'orders',
      title: 'Order Report',
      description: 'Download a comprehensive report of all orders',
      icon: <ShoppingCart className="h-6 w-6" />
    },
    {
      type: 'prescriptions',
      title: 'Prescription Report',
      description: 'Download a report of all prescription uploads',
      icon: <FileText className="h-6 w-6" />
    },
    {
      type: 'feedback',
      title: 'Feedback Report',
      description: 'Download a report of all customer feedback',
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      type: 'inventory',
      title: 'Inventory Report',
      description: 'Download a detailed inventory status report',
      icon: <Package className="h-6 w-6" />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-teal-800">Reports Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.type}
            className="bg-white rounded-lg shadow-lg p-6 border border-teal-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                  {report.icon}
                </div>
                <h2 className="text-xl font-semibold text-teal-800">{report.title}</h2>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{report.description}</p>
            
            <button
              onClick={() => handleDownload(report.type)}
              disabled={loading === report.type}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
                loading === report.type
                  ? 'bg-teal-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <Download className="h-5 w-5" />
              <span>
                {loading === report.type ? 'Downloading...' : 'Download Report'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsAdmin;