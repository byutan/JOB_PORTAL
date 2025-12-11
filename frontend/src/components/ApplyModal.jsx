import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { postingService } from '../services/postingService';

/**
 * ApplyModal: Modal cho phép ứng viên submit application cho một job posting
 * Hiển thị thông tin ứng viên dưới dạng form trước khi ứng tuyển
 */
const ApplyModal = ({ isOpen, onClose, posting, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Profile Details, 3: Confirm & Apply
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    emailAddr: '',
    phoneNumber: '',
    password: '',
    sex: 'Nam',
    birthDate: '',
    address: '',
    currentTitle: '',
    selfIntro: '',
    totalYearOfExp: 0,
    // Profile Details
    experiences: [],
    skills: [],
    cvs: [],
    foreignLanguages: [],
    certificates: [],
    education: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/skills');
        if (res.ok) {
          const data = await res.json();
          setAllSkills(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Validate and proceed to profile details
  const handleContinue = () => {
    setError('');
    
    // Basic validation
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.emailAddr.trim() || !formData.emailAddr.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    const hasDigit = /[0-9]/.test(formData.password);
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    if (!hasDigit || !hasUpper || !hasSpecial) {
      setError('Mật khẩu phải có 1 chữ số, 1 chữ hoa, 1 ký tự đặc biệt');
      return;
    }
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        setError('Ngày sinh không được trong tương lai');
        return;
      }
    }

    setStep(2);
  };

  // Step 2: Continue to confirmation
  const handleContinueToConfirm = () => {
    setError('');
    setStep(3);
  };

  // Step 3: Submit application
  const handleSubmitApplication = async () => {
    setError('');
    setSubmitting(true);

    try {
      await postingService.applyAsNewCandidate({
        ...formData,
        postID: posting.postID,
        totalYearOfExp: parseInt(formData.totalYearOfExp) || 0
      });
      setSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        resetForm();
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ứng tuyển thất bại');
      setSubmitting(false);
    }
  };

  // Add functions for managing profile sections
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { jobTitle: '', companyName: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (idx) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx)
    }));
  };

  const updateExperience = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === idx ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { schoolName: '', major: '', degree: '', startDate: '', endDate: '' }]
    }));
  };

  const removeEducation = (idx) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  const updateEducation = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === idx ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { certName: '', organization: '', issueDate: '', certURL: '' }]
    }));
  };

  const removeCertificate = (idx) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== idx)
    }));
  };

  const updateCertificate = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) => 
        i === idx ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      foreignLanguages: [...prev.foreignLanguages, { language: '', level: 'Sơ cấp' }]
    }));
  };

  const removeLanguage = (idx) => {
    setFormData(prev => ({
      ...prev,
      foreignLanguages: prev.foreignLanguages.filter((_, i) => i !== idx)
    }));
  };

  const updateLanguage = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      foreignLanguages: prev.foreignLanguages.map((lang, i) => 
        i === idx ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const addSkill = () => {
    if (!selectedSkillId) return;
    
    const skill = allSkills.find(s => s.SkillID === parseInt(selectedSkillId));
    if (!skill) return;
    
    // Check if skill already added
    if (formData.skills.some(s => s.SkillID === skill.SkillID)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    setSelectedSkillId('');
  };

  const removeSkill = (idx) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx)
    }));
  };

  const addCV = () => {
    setFormData(prev => ({
      ...prev,
      cvs: [...prev.cvs, { cvName: '', cvURL: '' }]
    }));
  };

  const removeCV = (idx) => {
    setFormData(prev => ({
      ...prev,
      cvs: prev.cvs.filter((_, i) => i !== idx)
    }));
  };

  const updateCV = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      cvs: prev.cvs.map((cv, i) => 
        i === idx ? { ...cv, [field]: value } : cv
      )
    }));
  };

  const handleGoBack = () => {
    setStep(step === 1 ? 1 : step - 1);
    setError('');
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      fullName: '',
      emailAddr: '',
      phoneNumber: '',
      password: '',
      sex: 'Nam',
      birthDate: '',
      address: '',
      currentTitle: '',
      selfIntro: '',
      totalYearOfExp: 0,
      experiences: [],
      skills: [],
      cvs: [],
      foreignLanguages: [],
      certificates: [],
      education: []
    });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Ứng Tuyển Vị Trí</h3>
            <p className="text-sm text-slate-500 mt-1">{posting?.postName}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={48} className="text-green-500 mb-3" />
              <p className="font-semibold text-green-700 text-center">Ứng tuyển thành công!</p>
              <p className="text-sm text-slate-500 mt-2">Tài khoản của bạn đã được tạo. Hãy kiểm tra email để xác nhận.</p>
            </div>
          ) : step === 1 ? (
            // Step 1: Enter Candidate Information
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Thông Tin Ứng Viên</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={formData.emailAddr}
                      onChange={(e) => handleFormChange('emailAddr', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Số Điện Thoại <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mật Khẩu <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      placeholder="Min 8 chars, 1 digit, 1 uppercase, 1 special"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Giới Tính</label>
                    <select
                      value={formData.sex}
                      onChange={(e) => handleFormChange('sex', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Ngày Sinh</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleFormChange('birthDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Địa Chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vị Trí Hiện Tại</label>
                  <input
                    type="text"
                    value={formData.currentTitle}
                    onChange={(e) => handleFormChange('currentTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Giới Thiệu Bản Thân</label>
                  <textarea
                    value={formData.selfIntro}
                    onChange={(e) => handleFormChange('selfIntro', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>
          ) : step === 2 ? (
            // Step 2: Profile Details
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900">Thêm Thông Tin Hồ Sơ (Tùy Chọn)</h4>
              
              {/* Experience Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">Kinh Nghiệm Làm Việc</h5>
                  <button type="button" onClick={addExperience} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input type="text" placeholder="Chức vụ" value={exp.jobTitle} onChange={(e) => updateExperience(idx, 'jobTitle', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="text" placeholder="Công ty" value={exp.companyName} onChange={(e) => updateExperience(idx, 'companyName', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="date" value={exp.startDate} onChange={(e) => updateExperience(idx, 'startDate', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="date" value={exp.endDate} onChange={(e) => updateExperience(idx, 'endDate', e.target.value)} className="text-sm p-2 border rounded" />
                    </div>
                    <textarea placeholder="Mô tả" value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} className="w-full text-sm p-2 border rounded" rows="2" />
                    <button type="button" onClick={() => removeExperience(idx)} className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">Học Vấn</h5>
                  <button type="button" onClick={addEducation} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input type="text" placeholder="Trường" value={edu.schoolName} onChange={(e) => updateEducation(idx, 'schoolName', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={(e) => updateEducation(idx, 'major', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="text" placeholder="Bằng cấp" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="date" value={edu.startDate} onChange={(e) => updateEducation(idx, 'startDate', e.target.value)} className="text-sm p-2 border rounded" />
                    </div>
                    <button type="button" onClick={() => removeEducation(idx)} className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">Kỹ Năng</h5>
                </div>
                <div className="flex gap-2 mb-3">
                  <select 
                    value={selectedSkillId} 
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="flex-1 text-sm p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- Chọn kỹ năng --</option>
                    {allSkills.map(skill => (
                      <option key={skill.SkillID} value={skill.SkillID}>
                        {skill.skillName} ({skill.skillCategory})
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={addSkill}
                    disabled={!selectedSkillId}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <span>{skill.skillName}</span>
                      <button 
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="hover:text-blue-900 font-semibold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">Ngoại Ngữ</h5>
                  <button type="button" onClick={addLanguage} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                {formData.foreignLanguages.map((lang, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg mb-2 flex gap-2 items-end">
                    <input type="text" placeholder="Ngôn ngữ" value={lang.language} onChange={(e) => updateLanguage(idx, 'language', e.target.value)} className="flex-1 text-sm p-2 border rounded" />
                    <select value={lang.level} onChange={(e) => updateLanguage(idx, 'level', e.target.value)} className="text-sm p-2 border rounded">
                      <option>Sơ cấp</option>
                      <option>Trung cấp</option>
                      <option>Nâng cao</option>
                      <option>Thành thạo</option>
                    </select>
                    <button type="button" onClick={() => removeLanguage(idx)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Certificates Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">Chứng Chỉ</h5>
                  <button type="button" onClick={addCertificate} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                {formData.certificates.map((cert, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input type="text" placeholder="Tên chứng chỉ" value={cert.certName} onChange={(e) => updateCertificate(idx, 'certName', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="text" placeholder="Tổ chức cấp" value={cert.organization} onChange={(e) => updateCertificate(idx, 'organization', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="date" value={cert.issueDate} onChange={(e) => updateCertificate(idx, 'issueDate', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="url" placeholder="URL chứng chỉ" value={cert.certURL} onChange={(e) => updateCertificate(idx, 'certURL', e.target.value)} className="text-sm p-2 border rounded" />
                    </div>
                    <button type="button" onClick={() => removeCertificate(idx)} className="text-red-500 text-sm flex items-center gap-1">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                ))}
              </div>

              {/* CV Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">CV</h5>
                  <button type="button" onClick={addCV} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Thêm
                  </button>
                </div>
                {formData.cvs.map((cv, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input type="text" placeholder="Tên CV" value={cv.cvName} onChange={(e) => updateCV(idx, 'cvName', e.target.value)} className="text-sm p-2 border rounded" />
                      <input type="url" placeholder="URL CV" value={cv.cvURL} onChange={(e) => updateCV(idx, 'cvURL', e.target.value)} className="text-sm p-2 border rounded" />
                    </div>
                    <button type="button" onClick={() => removeCV(idx)} className="text-red-500 text-sm flex items-center gap-1">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Step 3: Confirm Information
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Xác Nhận Thông Tin</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-600">Họ tên:</p><p className="font-medium text-slate-900">{formData.fullName}</p></div>
                  <div><p className="text-slate-600">Email:</p><p className="font-medium text-slate-900">{formData.emailAddr}</p></div>
                  <div><p className="text-slate-600">Số điện thoại:</p><p className="font-medium text-slate-900">{formData.phoneNumber}</p></div>
                  <div><p className="text-slate-600">Vị trí:</p><p className="font-medium text-slate-900">{formData.currentTitle || 'N/A'}</p></div>
                  <div><p className="text-slate-600">Địa chỉ:</p><p className="font-medium text-slate-900">{formData.address}</p></div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
                ✓ Tài khoản của bạn sẽ được tạo và bạn sẽ được liệt kê trong danh sách ứng viên cho vị trí này.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-slate-200 flex gap-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            {step > 1 && (
              <button
                onClick={handleGoBack}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay Lại
              </button>
            )}
            {step === 1 && (
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp Tục
              </button>
            )}
            {step === 2 && (
              <button
                onClick={handleContinueToConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Xác Nhận
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Đang ứng tuyển...' : 'Xác Nhận Ứng Tuyển'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
