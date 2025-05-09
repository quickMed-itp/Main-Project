import React, { useState } from 'react';
import { Download, FileText, BarChart2, TrendingUp, Users, ShoppingBag } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  downloadUrl: string;
}

const ReportsAdmin = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports: Report[] = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Monthly sales analysis and revenue reports',
      icon: <TrendingUp className="w-6 h-6" />,
      downloadUrl: '/api/reports/sales'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Current stock levels and inventory status',
      icon: <BarChart2 className="w-6 h-6" />,
      downloadUrl: '/api/reports/inventory'
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Customer demographics and purchase history',
      icon: <Users className="w-6 h-6" />,
      downloadUrl: '/api/reports/customers'
    },
    {
      id: 'orders',
      title: 'Order Report',
      description: 'Order statistics and delivery performance',
      icon: <ShoppingBag className="w-6 h-6" />,
      downloadUrl: '/api/reports/orders'
    }
  ];

  const handleDownload = async (reportId: string) => {
    try {
      const token = localStorage.getItem('pharmacy_token');
      const response = await fetch(`/api/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  {report.icon}
                </div>
                <h3 className="text-lg font-semibold">{report.title}</h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(report.id);
                }}
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">{report.description}</p>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {reports.find(r => r.id === selectedReport)?.title} Preview
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FileText className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-auto">
              <iframe
                src={`/api/reports/${selectedReport}/preview`}
                className="w-full h-full"
                title="Report Preview"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleDownload(selectedReport)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAdmin; 