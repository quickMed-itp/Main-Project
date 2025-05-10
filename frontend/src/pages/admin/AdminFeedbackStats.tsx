import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeedbackStats {
  pending: number;
  approved: number;
  rejected: number;
}

const AdminFeedbackStats = () => {
  const [stats, setStats] = useState<FeedbackStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem('pharmacy_token');
      const response = await axios.get('/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const feedbacks = response.data.data.feedbacks;
      const stats = feedbacks.reduce((acc: FeedbackStats, feedback: any) => {
        acc[feedback.status as keyof FeedbackStats]++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 });

      setStats(stats);
    } catch (err) {
      setError('Failed to fetch feedback statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'Number of Feedbacks',
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',   // Yellow for pending
          'rgba(40, 167, 69, 0.8)',   // Green for approved
          'rgba(220, 53, 69, 0.8)',   // Red for rejected
        ],
        borderColor: [
          'rgb(255, 193, 7)',
          'rgb(40, 167, 69)',
          'rgb(220, 53, 69)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Feedback Status Distribution',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return <div className="p-6">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Statistics</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-[400px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackStats; 