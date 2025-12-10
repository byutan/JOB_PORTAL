import React, { useState, useEffect } from 'react';
import { X, Search, Users, Mail, Phone } from 'lucide-react';
import { postingService } from '../services/postingService';

const CandidatesListModal = ({ isOpen, onClose, posting, onViewProfile }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && posting) {
      loadCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, posting?.postID]);

  const loadCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postingService.getCandidatesByPosting(posting.postID);
      console.log('Candidates Response:', data);
      // Dữ liệu từ get_candidates_by_post procedure
      const raw = data.candidates || data.data || data || [];
      const list = (Array.isArray(raw) ? raw : []).map((c, i) => {
        // normalize skills: may be a comma-separated string
        let skills = c.skills ?? c.skillList ?? c.skilllist ?? '';
        if (typeof skills === 'string') {
          skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        } else if (!Array.isArray(skills)) {
          skills = [];
        }

        return {
          CandidateID: c.CandidateID ?? c.candidateID ?? `c_${i}`,
          fullName: c.fullName ?? c.fullName ?? c.CandidateName ?? '',
          emailAddr: c.emailAddr ?? c.email ?? '',
          phoneNumber: c.phoneNumber ?? c.phone ?? '',
          currentTitle: c.currentTitle ?? c.CurrentJobTitle ?? '',
          totalYearOfExp: c.totalYearOfExp ?? c.totalYearOfExp ?? null,
          skills,
          selfIntro: c.selfIntro ?? c.intro ?? '',
          pickCandidate: c.pickCandidate ?? null,
          raw: c
        };
      });

      setCandidates(list);
      setFilteredCandidates(list);
    } catch (err) {
      setError(err.message);
      console.error('Candidates Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(term.toLowerCase()) ||
          c.emailAddr?.toLowerCase().includes(term.toLowerCase()) ||
          c.phoneNumber?.includes(term) ||
          c.currentTitle?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <Users size={24} />
            <div>
              <h2 className="text-xl font-bold">Danh Sách Ứng Viên</h2>
              <p className="text-blue-100 text-sm">{posting?.jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, điện thoại, vị trí..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải danh sách ứng viên...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={loadCandidates}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Thử Lại
              </button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">
                {searchTerm ? 'Không tìm thấy ứng viên phù hợp' : 'Chưa có ứng viên nào'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Hiển thị <span className="font-bold text-blue-600">{filteredCandidates.length}</span> ứng viên
              </div>

              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.CandidateID}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                >
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {candidate.fullName || 'N/A'}
                      </h3>
                      {candidate.currentTitle && (
                        <p className="text-sm text-gray-600 mt-1">
                          {candidate.currentTitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {candidate.matchPercentage !== undefined && (
                        <div className="text-right">
                          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {candidate.matchPercentage}% phù hợp
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => onViewProfile && onViewProfile(candidate.CandidateID)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Mail size={16} className="text-blue-500" />
                      <span className="text-sm break-all">{candidate.emailAddr || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Phone size={16} className="text-blue-500" />
                      <span className="text-sm">{candidate.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Experience */}
                  {candidate.totalYearOfExp !== undefined && (
                    <div className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold">Kinh nghiệm:</span> {candidate.totalYearOfExp} năm
                    </div>
                  )}

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Kỹ năng:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                            +{candidate.skills.length - 5} kỹ năng khác
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Self Introduction */}
                  {candidate.selfIntro && (
                    <div className="text-sm text-gray-700 italic border-l-4 border-blue-200 pl-4">
                      "{candidate.selfIntro}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidatesListModal;
