import React, { useState, useMemo } from 'react';
import { X, Search, Filter } from 'lucide-react';

const AppliesModal = ({ isOpen, onClose, applies, onViewCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, recent, older

  // Client-side filtering and search (instant, no API calls)
  const filteredApplies = useMemo(() => {
    let result = applies || [];

    // Search by name or email
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => {
        const name = (a.fullName || '').toLowerCase();
        const email = (a.userEmail || '').toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    }

    // Filter by recency
    if (filterStatus !== 'all') {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      result = result.filter(a => {
        const applyDateField = a.applyDate || a.applyOn || a.createdAt || a.createDate;
        if (!applyDateField) return true;
        
        const applyDate = new Date(applyDateField);
        if (filterStatus === 'recent') {
          return applyDate >= oneDayAgo;
        } else if (filterStatus === 'older') {
          return applyDate < oneDayAgo;
        }
        return true;
      });
    }

    return result;
  }, [applies, searchTerm, filterStatus]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
  };

  // Update display when applies prop changes
  React.useEffect(() => {
    if (isOpen && applies) {
      // Reset search/filter when modal opens with new applies
      setSearchTerm('');
      setFilterStatus('all');
    }
  }, [applies, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl mt-12 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-semibold">Danh sách ứng tuyển ({filteredApplies.length})</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b space-y-3 bg-slate-50">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-slate-600" />
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'recent', label: 'Trong 24h' },
                { value: 'older', label: 'Cũ hơn' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applies List */}
        <div className="p-4 flex-1 overflow-y-auto">
          {(!filteredApplies || filteredApplies.length === 0) && (
            <div className="text-sm text-slate-500 text-center py-8">
              {applies && applies.length === 0 ? 'Chưa có ứng viên ứng tuyển.' : 'Không tìm thấy ứng viên phù hợp.'}
            </div>
          )}

          <ul className="space-y-3">
            {filteredApplies && filteredApplies.map(a => {
              const applyDateField = a.applyDate || a.applyOn || a.createdAt || a.createDate;
              const applyDateStr = applyDateField ? new Date(applyDateField).toLocaleString('vi-VN') : '-';

              return (
                <li key={`${a.CandidateID}_${a.PostID || a.postID}`} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{a.fullName || a.userEmail || `Ứng viên #${a.CandidateID}`}</div>
                    <div className="text-xs text-slate-500">
                      📧 {a.userEmail || '-'} • 📅 {applyDateStr}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewCandidate(a.CandidateID)}
                    className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Xem hồ sơ
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppliesModal;
