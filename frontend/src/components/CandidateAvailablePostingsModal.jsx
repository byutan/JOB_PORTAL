import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { postingService } from '../services/postingService';

/**
 * COMPONENT: Candidate Available Postings Modal
 * Hiển thị danh sách tin tuyển dụng cho ứng viên
 * Ứng viên có thể ứng tuyển từng vị trí (chỉ 1 lần cho mỗi vị trí)
 */
const CandidateAvailablePostingsModal = ({ isOpen, onClose, candidateID, onApplySuccess }) => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedPostingIds, setAppliedPostingIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load postings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPostings();
    }
  }, [isOpen]);

  const loadPostings = async () => {
    setLoading(true);
    try {
      const data = await postingService.getAll();
      // Filter only active postings (not expired)
      const activePostings = data.filter(p => new Date(p.endDate) > new Date());
      setPostings(activePostings);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải danh sách tin tuyển dụng' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (postID) => {
    if (appliedPostingIds.has(postID)) {
      setMessage({ type: 'error', text: 'Bạn đã ứng tuyển cho vị trí này rồi!' });
      return;
    }

    if (!candidateID) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để ứng tuyển' });
      return;
    }

    setApplyingId(postID);
    try {
      await postingService.applyToPosting(postID, candidateID);
      // Add to applied set
      setAppliedPostingIds(prev => new Set([...prev, postID]));
      setMessage({ type: 'success', text: 'Ứng tuyển thành công!' });
      
      // Call success callback
      if (onApplySuccess) {
        onApplySuccess();
      }

      // Clear message after 2s
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Ứng tuyển thất bại' });
    } finally {
      setApplyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-40 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Danh Sách Vị Trí Tuyển Dụng</h2>
            <p className="text-sm text-slate-500 mt-1">Khám phá các cơ hội việc làm và ứng tuyển</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Notification */}
        {message.text && (
          <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Body */}
        <div className="p-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
              <p className="text-slate-500">Đang tải danh sách...</p>
            </div>
          ) : postings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Không có vị trí tuyển dụng nào đang mở</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {postings.map(posting => {
                const isApplied = appliedPostingIds.has(posting.postID);
                const isExpired = new Date(posting.endDate) < new Date();
                const daysRemaining = Math.ceil((new Date(posting.endDate) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={posting.postID} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{posting.postName}</h3>
                        <div className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">{posting.position}</span> • <span>{posting.location}</span>
                        </div>
                        {posting.companyName && (
                          <div className="text-xs text-slate-500 mt-1">{posting.companyName}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isExpired ? 'Đã hết hạn' : `${daysRemaining} ngày`}
                        </span>
                      </div>
                    </div>

                    {/* Salary & Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500">Mức lương:</span>
                        <div className="font-semibold text-slate-800">
                          {parseInt(posting.salaryMin).toLocaleString()} - {parseInt(posting.salaryMax).toLocaleString()} VND
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Hình thức:</span>
                        <div className="font-semibold text-slate-800">{posting.workForm}</div>
                      </div>
                    </div>

                    {/* Required Skills */}
                    {posting.requiredSkills && (
                      <div className="mb-4">
                        <span className="text-xs text-slate-500">Kỹ năng yêu cầu:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {posting.requiredSkills.split(',').map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description Preview */}
                    <div className="mb-4 text-sm text-slate-600 line-clamp-2">
                      {posting.postDesc}
                    </div>

                    {/* Apply Button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApply(posting.postID)}
                        disabled={isApplied || isExpired || applyingId === posting.postID}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isApplied
                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                            : isExpired
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : applyingId === posting.postID
                            ? 'bg-blue-500 text-white opacity-75 cursor-wait'
                            : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                        }`}
                      >
                        {applyingId === posting.postID ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Đang ứng tuyển...
                          </span>
                        ) : isApplied ? (
                          '✓ Đã ứng tuyển'
                        ) : isExpired ? (
                          'Hết hạn'
                        ) : (
                          'Ứng Tuyển'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
          Hiển thị {postings.length} vị trí tuyển dụng đang mở
        </div>
      </div>
    </div>
  );
};

export default CandidateAvailablePostingsModal;
