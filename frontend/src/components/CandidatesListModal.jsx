import React, { useState, useEffect } from 'react';
import { X, Search, Users, Mail, Phone, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { postingService } from '../services/postingService';

const CandidatesListModal = ({ isOpen, onClose, posting, onViewProfile, refreshKey }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCandidates: 0,
    avgMatchPercentage: 0,
    topSkills: {},
  });

  useEffect(() => {
    if (isOpen && posting) {
      loadCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, posting?.postID, refreshKey]);

  const loadCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      // Lấy dữ liệu từ 2 API: skill analysis (để match score) và applies (để lấy thông tin ứng viên đầy đủ)
      const [skillData, appliesData] = await Promise.all([
        postingService.getSkillAnalysis(posting.postID).catch(() => ({ candidates: [] })),
        postingService.getApplies(posting.postID).catch(() => [])
      ]);
      
      console.log('Skill Analysis Response:', skillData);
      console.log('Applies Response:', appliesData);
      
      // Tạo map skill analysis bằng CandidateID hoặc email để nhanh chóng lookup
      const skillMap = {};
      const raw = skillData.candidates || skillData.data || [];
      
      if (raw.length > 0) {
        console.log('First skill analysis keys:', Object.keys(raw[0]));
        raw.forEach(c => {
          // Thử tìm CandidateID từ các trường khác nếu không có
          const candId = c.CandidateID ?? c.candidateID;
          const email = c.ContactEmail ?? c.emailAddr ?? c.email ?? '';
          const name = c.CandidateName ?? c.fullName ?? '';
          
          if (candId) {
            skillMap[candId] = c;
          }
          if (email) {
            skillMap[`email:${email.toLowerCase()}`] = c;
          }
          if (name && email) {
            skillMap[`name_email:${name}:${email}`] = c;
          }
        });
      }

      // Dữ liệu từ applies - đây là dữ liệu chính và đáng tin cậy hơn
      const appliesList = Array.isArray(appliesData) ? appliesData : [];
      console.log('Raw applies data:', appliesList);
      
      const list = appliesList.map((apply, i) => {
        // Lấy thông tin cơ bản từ applies (từ Candidate + User table)
        const candId = apply.CandidateID ?? apply.candidateID;
        const fullName = apply.fullName ?? apply.CandidateName ?? apply.candidateName ?? '';
        const emailAddr = apply.userEmail ?? apply.emailAddr ?? apply.email ?? apply.ContactEmail ?? '';
        const phoneNumber = apply.phoneNumber ?? apply.phone ?? '';
        const currentTitle = apply.currentTitle ?? apply.CurrentJobTitle ?? '';
        
        // Tìm skill analysis data để lấy match percentage
        let skillInfo = skillMap[candId] || skillMap[`email:${emailAddr.toLowerCase()}`] || {};
        
        return {
          CandidateID: candId ?? `c_${i}`,
          fullName: fullName || 'N/A',
          emailAddr: emailAddr || 'N/A',
          phoneNumber: phoneNumber || 'N/A',
          currentTitle: currentTitle || 'N/A',
          totalYearOfExp: apply.totalYearOfExp ?? apply.YearsOfExperience ?? null,
          skills: [],
          selfIntro: apply.selfIntro ?? '',
          pickCandidate: apply.pickCandidate ?? null,
          // Từ skill analysis
          matchedSkillCount: skillInfo.MatchedSkillCount ?? 0,
          totalRequiredSkills: skillInfo.TotalRequiredSkills ?? 0,
          matchPercentage: skillInfo.MatchPercentage ?? 0,
          raw: { apply, skillInfo }
        };
      });

      console.log('Processed candidates:', list);
      setCandidates(list);
      setFilteredCandidates(list);
      
      // Calculate statistics
      calculateStats(list);
    } catch (err) {
      setError(err.message);
      console.error('Candidates Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (candidatesList) => {
    if (candidatesList.length === 0) {
      setStats({ totalCandidates: 0, avgMatchPercentage: 0, topSkills: {} });
      return;
    }

    // Calculate average match percentage từ dữ liệu procedure
    const validMatches = candidatesList.filter(c => c.matchPercentage > 0 || c.matchedSkillCount > 0);
    const avgMatch = validMatches.length > 0 
      ? validMatches.reduce((sum, c) => sum + (c.matchPercentage || 0), 0) / validMatches.length
      : 0;

    // Tạo top skills dựa trên MatchedSkillCount của các ứng viên
    // Cách tính: giả sử mỗi ứng viên matched những kỹ năng nhất định
    const skillFreq = {};
    candidatesList.forEach((candidate) => {
      if (candidate.matchedSkillCount > 0) {
        // Vì procedure không trả về chi tiết từng skill của mỗi candidate
        // Nên tính skill demand dựa trên số lượng ứng viên match với từng tỉ lệ
        const key = `Skill_${candidate.matchedSkillCount}_of_${candidate.totalRequiredSkills}`;
        skillFreq[key] = (skillFreq[key] || 0) + 1;
      }
    });

    // Chỉ lấy top skills nếu có
    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .reduce((obj, [skill, count]) => {
        // Format lại tên skill cho dễ đọc
        const displayName = skill.replace('Skill_', '').replace(/_/g, ' ');
        obj[displayName] = count;
        return obj;
      }, {});

    setStats({
      totalCandidates: candidatesList.length,
      avgMatchPercentage: Math.round(avgMatch * 100) / 100,
      topSkills,
    });
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

        {/* Statistics Section */}
        {!loading && filteredCandidates.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Thống Kê Ứng Viên</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Candidates */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Tổng Ứng Viên</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {stats.totalCandidates}
                    </p>
                  </div>
                  <Users size={28} className="text-blue-400 opacity-70" />
                </div>
              </div>

              {/* Top Skills Count */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Kỹ Năng Nổi Bật</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {Object.keys(stats.topSkills).length}
                    </p>
                  </div>
                  <Activity size={28} className="text-purple-400 opacity-70" />
                </div>
              </div>
            </div>

            {/* Top Skills */}
            {Object.keys(stats.topSkills).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Kỹ Năng Nổi Bật:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.topSkills).map(([skill, count]) => (
                    <span
                      key={skill}
                      className="inline-block bg-white text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-300 font-medium"
                    >
                      {skill} <span className="ml-1 text-blue-500">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

                  {/* Skill Match Info from Procedure */}
                  {candidate.matchedSkillCount !== undefined && candidate.totalRequiredSkills !== undefined && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">
                        Kỹ Năng Phù Hợp: <span className="text-lg text-blue-700">{candidate.matchedSkillCount}/{candidate.totalRequiredSkills}</span>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Độ khớp: <span className="font-bold text-blue-900">{candidate.matchPercentage}%</span>
                      </p>
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
