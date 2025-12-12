import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, TrendingUp, Calendar, Activity } from 'lucide-react';
import { postingService } from '../services/postingService';

const StatisticsDashboard = ({ isOpen, onClose, postings }) => {
  const [stats, setStats] = useState({
    totalPostings: 0,
    totalApplicants: 0,
    activePostings: 0,
    expiredPostings: 0,
    topPostingsByApplicants: [],
    skillsInDemand: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postings.length > 0) {
      loadStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postings?.length]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const now = new Date();

      // Aggregate data from all postings
      let totalApplicants = 0;
      const topPostingsByApplicants = [];
      const skillsInDemand = {};
      const appliesMap = {};

      // Load applies data for each posting
      for (const posting of postings) {
        try {
          const applies = await postingService.getApplies(posting.postID);
          appliesMap[posting.postID] = applies;
          const applicantCount = applies.length;
          totalApplicants += applicantCount;

          // Track applies per posting
          topPostingsByApplicants.push({
            postID: posting.postID,
            jobTitle: posting.jobTitle,
            companyName: posting.companyName || posting.repCompanyName || 'N/A',
            applicants: applicantCount,
            salaryMin: posting.salaryMin,
            salaryMax: posting.salaryMax,
          });

          // Extract skills from applicants
          applies.forEach((apply) => {
            if (apply.skills && Array.isArray(apply.skills)) {
              apply.skills.forEach((skill) => {
                skillsInDemand[skill] = (skillsInDemand[skill] || 0) + 1;
              });
            }
          });
        } catch (err) {
          console.error(`Failed to load applies for posting ${posting.postID}:`, err);
        }
      }

      // Calculate posting status
      const activePostings = postings.filter(
        (p) => new Date(p.endDate) > now
      ).length;
      const expiredPostings = postings.length - activePostings;

      // Sort top postings by applicants
      topPostingsByApplicants.sort((a, b) => b.applicants - a.applicants);

      // Sort skills by demand
      const topSkills = Object.entries(skillsInDemand)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [skill, count]) => {
          obj[skill] = count;
          return obj;
        }, {});

      setStats({
        totalPostings: postings.length,
        totalApplicants,
        activePostings,
        expiredPostings,
        topPostingsByApplicants: topPostingsByApplicants.slice(0, 5),
        skillsInDemand: topSkills,
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const avgApplicantsPerPosting =
    stats.totalPostings > 0
      ? Math.round(stats.totalApplicants / stats.totalPostings)
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <BarChart3 size={28} />
            <div>
              <h2 className="text-2xl font-bold">Bảng Thống Kê</h2>
              <p className="text-indigo-100 text-sm">Tổng quan hoạt động tuyển dụng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-500 rounded-lg transition text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-300 border-t-indigo-600"></div>
              <p className="text-gray-600 mt-4">Đang tải thống kê...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Postings */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Tổng Tin Tuyển</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {stats.totalPostings}
                      </p>
                    </div>
                    <Briefcase size={32} className="text-blue-400" />
                  </div>
                </div>

                {/* Total Applicants */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Tổng Ứng Viên</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {stats.totalApplicants}
                      </p>
                    </div>
                    <Users size={32} className="text-green-400" />
                  </div>
                </div>

                {/* Active Postings */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Tin Đang Hoạt</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {stats.activePostings}
                      </p>
                    </div>
                    <Activity size={32} className="text-purple-400" />
                  </div>
                </div>

                {/* Avg Applicants */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">TB Ứng Viên/Tin</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">
                        {avgApplicantsPerPosting}
                      </p>
                    </div>
                    <TrendingUp size={32} className="text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Overview */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar size={20} className="text-indigo-600" />
                    <span>Trạng Thái Tin Tuyển</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Tin Đang Hoạt
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {stats.activePostings}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              stats.totalPostings > 0
                                ? (stats.activePostings / stats.totalPostings) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Tin Hết Hạn
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          {stats.expiredPostings}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              stats.totalPostings > 0
                                ? (stats.expiredPostings / stats.totalPostings) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 5 Skills */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    <span>Top Kỹ Năng Được Tìm Kiếm</span>
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(stats.skillsInDemand).length > 0 ? (
                      Object.entries(stats.skillsInDemand).map(([skill, count]) => {
                        const maxCount = Math.max(
                          ...Object.values(stats.skillsInDemand)
                        );
                        return (
                          <div key={skill}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {skill}
                              </span>
                              <span className="text-sm font-bold text-indigo-600">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(count / maxCount) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-600 text-sm italic">
                        Chưa có dữ liệu kỹ năng
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Postings by Applicants */}
              {stats.topPostingsByApplicants.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Users size={20} className="text-indigo-600" />
                    <span>Top 5 Tin Tuyển Có Nhiều Ứng Viên</span>
                  </h3>

                  <div className="space-y-3">
                    {stats.topPostingsByApplicants.map((posting, idx) => (
                      <div
                        key={posting.postID}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold text-indigo-600">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {posting.jobTitle}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {posting.companyName}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {posting.applicants}
                            </p>
                            <p className="text-xs text-gray-600">ứng viên</p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-300 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                stats.topPostingsByApplicants[0]
                                  ? (posting.applicants /
                                      stats.topPostingsByApplicants[0].applicants) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                          <span>
                            Mức lương: {posting.salaryMin?.toLocaleString()} -{' '}
                            {posting.salaryMax?.toLocaleString()} VND
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default StatisticsDashboard;
