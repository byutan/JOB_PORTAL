import React, { useState } from 'react';
import { X, Loader2, Plus, Trash2, Edit2, Check, XCircle } from 'lucide-react';
import { candidateService } from '../services/candidateService';

/**
 * COMPONENT: Candidate Profile Edit Modal v3
 * Cho phép ứng viên chỉnh sửa toàn bộ profile + Add/Edit/Delete
 */
const CandidateProfileEditModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [candidateID, setCandidateID] = useState('');
  const [candidateIDError, setCandidateIDError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('basic');

  const [profileData, setProfileData] = useState({
    fullName: '',
    emailAddr: '',
    phoneNumber: '',
    address: '',
    currentTitle: '',
    selfIntro: '',
    totalYearOfExp: 0,
    experiences: [],
    education: [],
    certificates: [],
    skills: [],
    languages: []
  });

  const [originalData, setOriginalData] = useState(null);
  const [editingIndex, setEditingIndex] = useState({ type: null, index: null });
  const [editingItem, setEditingItem] = useState({});

  // Load candidate profile
  const handleLoadProfile = async () => {
    setCandidateIDError('');
    setMessage({ type: '', text: '' });

    if (!candidateID || candidateID.trim() === '') {
      setCandidateIDError('Vui lòng nhập ID ứng viên');
      return;
    }

    if (isNaN(candidateID) || parseInt(candidateID) <= 0) {
      setCandidateIDError('ID ứng viên phải là một số dương');
      return;
    }

    setLoading(true);
    try {
      const profile = await candidateService.getProfile(candidateID);
      
      const userInfo = profile.userInfo || (profile.candidate ? {
        fullName: profile.candidate.fullName || '',
        emailAddr: profile.candidate.userEmail || profile.candidate.emailAddr || '',
        phoneNumber: profile.candidate.phoneNumber || '',
        address: profile.candidate.address || ''
      } : {});

      const experiences = profile.experiences || [];
      const education = profile.education || [];
      const certificates = profile.certificates || [];
      const skills = profile.skills || [];
      const languages = profile.languages || [];

      setProfileData({
        fullName: userInfo.fullName || '',
        emailAddr: userInfo.emailAddr || '',
        phoneNumber: userInfo.phoneNumber || '',
        address: userInfo.address || '',
        currentTitle: profile.candidate?.currentTitle || '',
        selfIntro: profile.candidate?.selfIntro || '',
        totalYearOfExp: profile.candidate?.totalYearOfExp || 0,
        experiences,
        education,
        certificates,
        skills,
        languages
      });

      // Keep full snapshot for change detection
      const snapshot = {
        fullName: userInfo.fullName || '',
        emailAddr: userInfo.emailAddr || '',
        phoneNumber: userInfo.phoneNumber || '',
        address: userInfo.address || '',
        currentTitle: profile.candidate?.currentTitle || '',
        selfIntro: profile.candidate?.selfIntro || '',
        totalYearOfExp: profile.candidate?.totalYearOfExp || 0,
        experiences,
        education,
        certificates,
        skills,
        languages
      };

      setOriginalData(snapshot);

      setStep(2);
      setActiveTab('basic');
    } catch (err) {
      setCandidateIDError(err.message || 'Không tìm thấy ứng viên');
    } finally {
      setLoading(false);
    }
  };

  // Update basic fields
  const handleFormChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Edit item - Start editing
  const startEdit = (type, index, item) => {
    setEditingIndex({ type, index });
    setEditingItem({ ...item });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingIndex({ type: null, index: null });
    setEditingItem({});
  };

  // Save edit
  const saveEdit = () => {
    const { type, index } = editingIndex;
    if (index === null || type === null) return;

    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? editingItem : item
      )
    }));

    cancelEdit();
  };

  // Delete item
  const deleteItem = (type, index) => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Add new item
  const addNewItem = (type) => {
    const templates = {
      experiences: {
        jobTitle: '',
        CompanyName: '',
        startDate: '',
        endDate: '',
        expDesc: ''
      },
      education: {
        schoolName: '',
        major: '',
        degree: '',
        startDate: '',
        endDate: ''
      },
      certificates: {
        certName: '',
        organization: '',
        issueDate: '',
        certURL: ''
      },
      skills: {
        skillName: ''
      }
    };

    setProfileData(prev => ({
      ...prev,
      [type]: [...prev[type], templates[type]]
    }));
  };

  // Submit profile
  const handleSubmitUpdate = async () => {
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const payload = {
        fullName: profileData.fullName,
        emailAddr: profileData.emailAddr,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        currentTitle: profileData.currentTitle,
        selfIntro: profileData.selfIntro,
        totalYearOfExp: profileData.totalYearOfExp,
        experiences: profileData.experiences,
        education: profileData.education,
        certificates: profileData.certificates
      };

      await candidateService.updateFullProfile(parseInt(candidateID), payload);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });

      // refresh original data to current
      setOriginalData(JSON.parse(JSON.stringify(profileData)));

      setTimeout(() => {
        onClose();
        resetForm();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCandidateID('');
    setCandidateIDError('');
    setProfileData({
      fullName: '',
      emailAddr: '',
      phoneNumber: '',
      address: '',
      currentTitle: '',
      selfIntro: '',
      totalYearOfExp: 0,
      experiences: [],
      education: [],
      certificates: [],
      skills: [],
      languages: []
    });
    setOriginalData(null);
    setEditingIndex({ type: null, index: null });
    setEditingItem({});
  };

  const hasChanges = originalData ? JSON.stringify(profileData) !== JSON.stringify(originalData) : false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-40 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Chỉnh Sửa Hồ Sơ Ứng Viên</h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === 1 ? 'Nhập ID ứng viên để tải hồ sơ' : 'Cập nhật thông tin cá nhân'}
            </p>
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
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Ứng Viên <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={candidateID}
                      onChange={(e) => {
                        setCandidateID(e.target.value);
                        setCandidateIDError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleLoadProfile();
                      }}
                      placeholder="Nhập ID ứng viên (vd: 1, 2, 3...)"
                      className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all outline-none ${
                        candidateIDError
                          ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                          : 'border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                    {candidateIDError && (
                      <p className="text-red-600 text-sm mt-2 font-medium">❌ {candidateIDError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLoadProfile}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      'Tải Profile'
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-2">Hướng dẫn:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Nhập ID ứng viên từ database (ví dụ: 1, 2, 3...)</li>
                  <li>Nhấn "Tải Profile" hoặc nhấn Enter</li>
                  <li>Hệ thống sẽ tải thông tin hiện tại của ứng viên</li>
                  <li>Bạn có thể chỉnh sửa các trường và lưu thay đổi</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                {[
                  { id: 'basic', label: 'Thông Tin Cơ Bản' },
                  { id: 'experience', label: 'Kinh Nghiệm'},
                  { id: 'education', label: 'Học Vấn' },
                  { id: 'certificate', label: 'Chứng Chỉ' },
                  { id: 'skill', label: 'Kỹ Năng'}
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* BASIC INFO TAB */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Họ và Tên <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.fullName.length}/255</span>
                    </div>
                    <input
                      type="text"
                      maxLength="255"
                      value={profileData.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.emailAddr.length}/255</span>
                    </div>
                    <input
                      type="email"
                      maxLength="255"
                      value={profileData.emailAddr}
                      onChange={(e) => handleFormChange('emailAddr', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Số Điện Thoại <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.phoneNumber.length}/25</span>
                    </div>
                    <input
                      type="text"
                      maxLength="25"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Địa Chỉ <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.address.length}/255</span>
                    </div>
                    <input
                      type="text"
                      maxLength="255"
                      value={profileData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Hà Nội"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Vị Trí Hiện Tại <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.currentTitle.length}/255</span>
                    </div>
                    <input
                      type="text"
                      maxLength="255"
                      value={profileData.currentTitle}
                      onChange={(e) => handleFormChange('currentTitle', e.target.value)}
                      placeholder="VD: Senior Developer, Project Manager..."
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Năm Kinh Nghiệm <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={profileData.totalYearOfExp}
                      onChange={(e) => handleFormChange('totalYearOfExp', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Giới Thiệu Bản Thân <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span></span>
                      <span>{profileData.selfIntro.length}/2500</span>
                    </div>
                    <textarea
                      maxLength="2500"
                      rows="5"
                      value={profileData.selfIntro}
                      onChange={(e) => handleFormChange('selfIntro', e.target.value)}
                      placeholder="Giới thiệu về bản thân, kỹ năng, kinh nghiệm của bạn..."
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm resize-none"
                    />
                  </div>

                  {!hasChanges && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                      Không có thay đổi nào so với dữ liệu hiện tại
                    </div>
                  )}
                </div>
              )}

              {/* EXPERIENCE TAB */}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 flex-1">
                       Danh sách kinh nghiệm làm việc ({profileData.experiences.length})
                    </div>
                    <button
                      onClick={() => addNewItem('experiences')}
                      className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                      <Plus size={18} /> Thêm
                    </button>
                  </div>

                  {profileData.experiences.length > 0 ? (
                    profileData.experiences.map((exp, idx) => (
                      <div key={idx} className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        {editingIndex.type === 'experiences' && editingIndex.index === idx ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.jobTitle || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, jobTitle: e.target.value })}
                              placeholder="Vị trí"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.CompanyName || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, CompanyName: e.target.value })}
                              placeholder="Công ty"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={editingItem.startDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded text-sm"
                              />
                              <input
                                type="date"
                                value={editingItem.endDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded text-sm"
                              />
                            </div>
                            <textarea
                              maxLength="1000"
                              value={editingItem.expDesc || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, expDesc: e.target.value })}
                              placeholder="Mô tả công việc"
                              rows="3"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <Check size={16} /> Lưu
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <XCircle size={16} /> Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800">{exp.jobTitle}</h4>
                                <p className="text-sm text-slate-600">{exp.CompanyName}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(exp.startDate).toLocaleDateString('vi-VN')} - {new Date(exp.endDate).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit('experiences', idx, exp)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem('experiences', idx)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700">{exp.expDesc}</p>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">Chưa có kinh nghiệm nào</p>
                  )}
                </div>
              )}

              {/* EDUCATION TAB */}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 flex-1">
                      Danh sách học vấn ({profileData.education.length})
                    </div>
                    <button
                      onClick={() => addNewItem('education')}
                      className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                      <Plus size={18} /> Thêm
                    </button>
                  </div>

                  {profileData.education.length > 0 ? (
                    profileData.education.map((edu, idx) => (
                      <div key={idx} className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        {editingIndex.type === 'education' && editingIndex.index === idx ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.schoolName || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, schoolName: e.target.value })}
                              placeholder="Tên trường"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.major || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, major: e.target.value })}
                              placeholder="Chuyên ngành"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.degree || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                              placeholder="Bằng cấp"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={editingItem.startDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded text-sm"
                              />
                              <input
                                type="date"
                                value={editingItem.endDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <Check size={16} /> Lưu
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <XCircle size={16} /> Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800">{edu.schoolName}</h4>
                                <p className="text-sm text-slate-600">{edu.major}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {edu.degree} • {new Date(edu.startDate).toLocaleDateString('vi-VN')} - {new Date(edu.endDate).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit('education', idx, edu)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem('education', idx)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">Chưa có học vấn nào</p>
                  )}
                </div>
              )}

              {/* CERTIFICATE TAB */}
              {activeTab === 'certificate' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 flex-1">
                       Danh sách chứng chỉ ({profileData.certificates.length})
                    </div>
                    <button
                      onClick={() => addNewItem('certificates')}
                      className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                      <Plus size={18} /> Thêm
                    </button>
                  </div>

                  {profileData.certificates.length > 0 ? (
                    profileData.certificates.map((cert, idx) => (
                      <div key={idx} className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        {editingIndex.type === 'certificates' && editingIndex.index === idx ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.certName || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, certName: e.target.value })}
                              placeholder="Tên chứng chỉ"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              maxLength="255"
                              value={editingItem.organization || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                              placeholder="Tổ chức cấp"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="date"
                              value={editingItem.issueDate || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, issueDate: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="url"
                              value={editingItem.certURL || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, certURL: e.target.value })}
                              placeholder="Link chứng chỉ (tùy chọn)"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <Check size={16} /> Lưu
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm flex items-center justify-center gap-2"
                              >
                                <XCircle size={16} /> Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800">{cert.certName}</h4>
                                <p className="text-sm text-slate-600">{cert.organization}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                </p>
                                {cert.certURL && (
                                  <a href={cert.certURL} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                    Xem chứng chỉ →
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit('certificates', idx, cert)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem('certificates', idx)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">Chưa có chứng chỉ nào</p>
                  )}
                </div>
              )}

              {/* SKILL TAB */}
              {activeTab === 'skill' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 flex-1">
                       Danh sách kỹ năng ({profileData.skills.length})
                    </div>
                    <button
                      onClick={() => addNewItem('skills')}
                      className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                      <Plus size={18} /> Thêm
                    </button>
                  </div>

                  {profileData.skills.length > 0 ? (
                    <div className="space-y-2">
                      {profileData.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-lg p-3">
                          {editingIndex.type === 'skills' && editingIndex.index === idx ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                maxLength="255"
                                value={editingItem.skillName || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, skillName: e.target.value })}
                                placeholder="Tên kỹ năng"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                              />
                              <button
                                onClick={saveEdit}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full font-medium">
                                {skill.skillName}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit('skills', idx, skill)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem('skills', idx)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Chưa có kỹ năng nào</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition-colors"
            >
              Quay Lại
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition-colors"
          >
            Hủy
          </button>
          {step === 2 && (
            <button
              onClick={handleSubmitUpdate}
              disabled={submitting || !hasChanges}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                submitting || !hasChanges
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                'Lưu Thay Đổi'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileEditModal;
