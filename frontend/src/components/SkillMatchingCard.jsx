import React, { useState, useEffect } from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';
import { postingService } from '../services/postingService';

const SkillMatchingCard = ({ isOpen, onClose, posting }) => {
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('match'); // 'match' or 'name'

  useEffect(() => {
    if (isOpen && posting) {
      loadSkillAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, posting?.postID]);

  const loadSkillAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postingService.getSkillAnalysis(posting.postID);
      console.log('Skill Analysis Response:', data);
      // Dữ liệu từ sp_AnalyzeCandidateSkillMatch procedure
      const raw = data.candidates || data.data || data || [];
      const normalized = (Array.isArray(raw) ? raw : []).map((r, i) => {
        const match = Number(r.MatchPercentage ?? r.matchPercentage ?? 0) || 0;
        const matchedCount = Number(r.MatchedSkillCount ?? r.matchedSkillCount ?? r.matchedSkills ?? 0) || 0;
        const totalRequired = Number(r.TotalRequiredSkills ?? r.totalRequiredSkills ?? r.totalSkills ?? 0) || 0;
        const matchedListRaw = r.matchedSkillList || r.MatchedSkillList || r.matchedSkills || '';
        const matchedSkills = typeof matchedListRaw === 'string'
          ? matchedListRaw.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(matchedListRaw) ? matchedListRaw : [];

        return {
          CandidateID: r.CandidateID ?? `c_${i}`,
          fullName: r.CandidateName ?? r.fullName ?? r.fullname ?? '',
          emailAddr: r.ContactEmail ?? r.emailAddr ?? '',
          currentTitle: r.CurrentJobTitle ?? r.currentTitle ?? '',
          matchPercentage: match,
          matchedCount,
          totalRequired,
          matchedSkills,
          raw: r
        };
      });

      setSkillData(normalized);
    } catch (err) {
      setError(err.message);
      console.error('Skill Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedData = () => {
    const sorted = [...skillData];
    if (sortBy === 'match') {
      // sort descending by normalized matchPercentage
      sorted.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else {
      sorted.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }
    return sorted;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Rất phù hợp';
    if (percentage >= 60) return 'Phù hợp';
    if (percentage >= 40) return 'Tạm chấp nhận';
    return 'Cần xem xét';
  };

  if (!isOpen) return null;

  const sortedData = getSortedData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <Zap size={24} />
            <div>
              <h2 className="text-xl font-bold">Phân Tích Kỹ Năng</h2>
              <p className="text-purple-100 text-sm">{posting?.jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-500 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sort Options */}
        <div className="sticky top-16 bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
            <button
              onClick={() => setSortBy('match')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'match'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Độ Phù Hợp
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'name'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tên Ứng Viên
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600"></div>
              <p className="text-gray-600 mt-4">Đang phân tích kỹ năng...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={loadSkillAnalysis}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Thử Lại
              </button>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="text-center py-12">
              <Zap size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Chưa có dữ liệu phân tích</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Summary Stats */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <TrendingUp size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-gray-700">Rất Phù Hợp (≥80%)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {sortedData.filter((c) => {
                        const pct = c.MatchPercentage || c.matchPercentage || 0;
                        return pct >= 80;
                      }).length}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
                    <p className="text-sm text-gray-700">Phù Hợp (60-79%)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {sortedData.filter((c) => {
                        const pct = c.MatchPercentage || c.matchPercentage || 0;
                        return pct >= 60 && pct < 80;
                      }).length}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="text-center">
                    <TrendingUp size={24} className="mx-auto text-yellow-600 mb-2" />
                    <p className="text-sm text-gray-700">Tổng Ứng Viên</p>
                    <p className="text-2xl font-bold text-yellow-600">{sortedData.length}</p>
                  </div>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-3">
                {sortedData.map((candidate, idx) => {
                  // Data từ sp_AnalyzeCandidateSkillMatch: CandidateName, ContactEmail, CurrentJobTitle, 
                  // MatchPercentage, MatchedSkillCount, TotalRequiredSkills
                  const matchPercentage = candidate.matchPercentage || 0;
                  const candidateName = candidate.fullName || 'N/A';
                  const email = candidate.emailAddr || '';
                  const jobTitle = candidate.currentTitle || 'N/A';
                  const matchedCount = candidate.matchedCount || 0;
                  const totalRequired = candidate.totalRequired || 0;

                  return (
                    <div
                      key={candidate.CandidateID || idx}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            #{idx + 1} - {candidateName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{jobTitle}</p>
                          {email && <p className="text-xs text-blue-600 mt-0.5">{email}</p>}
                        </div>
                        <div className="text-right ml-4">
                          <div className={`${getMatchColor(matchPercentage)} text-white px-4 py-2 rounded-lg text-sm font-bold`}>
                            {Number(matchPercentage).toFixed(1)}%
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {getMatchLabel(matchPercentage)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                        <div
                          className={`h-full ${getMatchColor(matchPercentage)} transition-all duration-500`}
                          style={{ width: `${Math.max(0, Math.min(100, matchPercentage))}%` }}
                        ></div>
                      </div>

                      {/* Skills Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3 p-3 bg-gray-50 rounded">
                        <div>
                          <span className="text-gray-600">Kỹ năng phù hợp:</span>
                          <p className="font-bold text-green-600 text-sm">{matchedCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Yêu cầu:</span>
                          <p className="font-bold text-blue-600 text-sm">{totalRequired}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tỷ lệ:</span>
                          <p className="font-bold text-purple-600 text-sm">
                            {totalRequired > 0 ? `${matchedCount}/${totalRequired}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

export default SkillMatchingCard;
