import { useState, useEffect } from 'react';
import ReportList from '../components/reports/ReportList';
import { getReports } from '../utils/adminApi';
import { FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const reportsData = await getReports();
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Count pending and resolved reports
  const pendingCount = reports.filter(report => report.status === 'Pending').length;
  const resolvedCount = reports.filter(report => report.status === 'Resolved').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
        <p className="text-sm text-gray-500">Handle reported listings and content</p>
      </div>
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card bg-amber-50 border border-amber-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <FiAlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">Total Reports</p>
              <p className="text-xl font-bold">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card bg-red-50 border border-red-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <FiClock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Pending</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card bg-green-50 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Resolved</p>
              <p className="text-xl font-bold">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <ReportList reports={reports} />
    </div>
  );
};

export default Reports;