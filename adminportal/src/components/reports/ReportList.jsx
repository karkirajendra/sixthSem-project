import { useState } from 'react';
import { FiAlertTriangle, FiCheck, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

const ReportList = ({ reports }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter reports based on status
  const filteredReports = reports.filter(report => {
    return statusFilter === 'all' || report.status.toLowerCase() === statusFilter;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium">Reported Listings</h2>
        
        <div>
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="bg-white rounded-lg shadow-card p-4 border-l-4 border-amber-500"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-4">
                    <FiAlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{report.property}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {report.reason}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500">
                      <span>Reported by: {report.reportedBy}</span>
                      <span className="mx-2">•</span>
                      <span>Date: {report.date}</span>
                      <span className="mx-2">•</span>
                      <span className={`font-medium ${
                        report.status === 'Pending' ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        Status: {report.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <button className="btn-outline flex items-center text-xs">
                    <FiMessageSquare className="mr-1 h-3 w-3" />
                    Contact User
                  </button>
                  
                  {report.status === 'Pending' ? (
                    <button className="btn-secondary flex items-center text-xs">
                      <FiCheck className="mr-1 h-3 w-3" />
                      Resolve
                    </button>
                  ) : (
                    <button className="btn-danger flex items-center text-xs">
                      <FiTrash2 className="mr-1 h-3 w-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          <FiAlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no reports matching your current filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportList;