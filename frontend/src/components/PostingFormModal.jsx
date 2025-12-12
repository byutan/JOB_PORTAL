import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

/**
 * COMPONENT: Form Modal
 * Dùng chung cho cả chức năng Thêm mới và Chỉnh sửa
 */
const PostingFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditMode = !!initialData;
  
  // State khởi tạo cho form
  const defaultState = {
    postName: '', salaryMin: 0, salaryMax: 0, position: '',
    location: '', workForm: 'Full-time', endDate: '',
    domain: 'IT', postDesc: '', EmployerID: 19, ModStaffID: 17,
    requiredSkills: []
  };

  const [formData, setFormData] = useState(defaultState);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');

  // Load dữ liệu khi mở modal hoặc khi initialData thay đổi
  useEffect(() => {
    // Fetch all available skills
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

  // schedule the state update to avoid synchronous setState inside effect
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        if (initialData) {
          // Parse requiredSkills if it's a string (from API)
          let requiredSkillsArray = initialData.requiredSkills || [];
          if (typeof initialData.requiredSkills === 'string' && initialData.requiredSkills.length > 0) {
            const skillNames = initialData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
            // Match skill names with allSkills to get SkillID
            requiredSkillsArray = skillNames
              .map(name => allSkills.find(skill => skill.skillName === name || skill.SkillName === name))
              .filter(skill => skill !== undefined);
          }

          setFormData({
            ...initialData,
            // Chuyển đổi ngày từ ISO (Backend) sang YYYY-MM-DD (Input Date)
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
            requiredSkills: requiredSkillsArray
          });
        } else {
          setFormData(defaultState);
        }
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, allSkills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    
    const skill = allSkills.find(s => s.SkillID === parseInt(selectedSkillId));
    if (!skill) return;
    
    // Check if skill already added
    if (formData.requiredSkills.some(s => s.SkillID === skill.SkillID)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, skill]
    }));
    setSelectedSkillId('');
  };

  const handleRemoveSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s.SkillID !== skillId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-40 p-4 transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Cập Nhật Tin Tuyển Dụng' : 'Tạo Tin Tuyển Dụng Mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin bên dưới</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột Trái */}
            <div className="space-y-4">
              <div>
                <label className="label-text flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                  <span>Tiêu đề bài đăng</span>
                  <span className={`text-xs ${formData.postName.length > 255 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {formData.postName.length}/255 ký tự
                  </span>
                </label>
                <input 
                  type="text" name="postName" required maxLength="255"
                  disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.postName} onChange={handleChange}
                  placeholder="VD: Senior React Developer"
                />
                {isEditMode && <span className="text-xs text-amber-600 mt-1 block">
                   Không thể sửa tiêu đề (Ràng buộc DB)</span>}
              </div>

              <div>
                <label className="label-text flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                  <span>Vị trí (Position)</span>
                  <span className={`text-xs ${formData.position.length > 255 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {formData.position.length}/255 ký tự
                  </span>
                </label>
                <input 
                  type="text" name="position" required maxLength="255"
                  disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                  value={formData.position} onChange={handleChange}
                  placeholder="VD: Senior Developer"
                />
              </div>

              <div>
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Ngành nghề</label>
                <select 
                  name="domain" disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                  value={formData.domain} onChange={handleChange}
                >
                  <option value="IT">Công nghệ thông tin</option>
                  <option value="Marketing">Marketing & Sales</option>
                  <option value="Finance">Tài chính / Kế toán</option>
                  <option value="HR">Nhân sự</option>
                </select>
              </div>
            </div>

            {/* Cột Phải */}
            <div className="space-y-4">
               <div>
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Mức lương (VND)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" name="salaryMin" required placeholder="Min"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    value={formData.salaryMin} onChange={handleChange}
                  />
                  <span className="self-center">-</span>
                  <input 
                    type="number" name="salaryMax" required placeholder="Max"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                    value={formData.salaryMax} onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Ngày hết hạn</label>
                <input 
                  type="date" name="endDate" required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                  value={formData.endDate} onChange={handleChange}
                />
              </div>

              <div>
                <label className="label-text flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                  <span>Địa điểm làm việc</span>
                  <span className={`text-xs ${formData.location.length > 255 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {formData.location.length}/255 ký tự
                  </span>
                </label>
                <input 
                  type="text" name="location" disabled={isEditMode} maxLength="255"
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                  value={formData.location} onChange={handleChange}
                  placeholder="VD: Hà Nội, TP.HCM"
                />
              </div>
            </div>

            {/* Hình thức làm việc */}
            <div className="col-span-1 md:col-span-2">
              <label className="label-text mb-2 block text-sm font-semibold text-slate-700">Hình thức làm việc</label>
              <div className="flex gap-6">
                {['Full-time', 'Part-time', 'others'].map(type => (
                  <label key={type} className="flex items-center cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="radio" name="workForm" value={type}
                        disabled={isEditMode}
                        checked={formData.workForm === type} onChange={handleChange}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-600 transition-all"
                      />
                      <span className="absolute bg-blue-600 w-2 h-2 rounded-full opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all"></span>
                    </div>
                    <span className="ml-2 text-slate-700 group-hover:text-blue-600 text-sm">{type === 'others' ? 'Khác' : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mô tả công việc */}
            <div className="col-span-1 md:col-span-2">
              <label className="label-text flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                <span>Mô tả công việc</span>
                <span className={`text-xs ${formData.postDesc.length > 2500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.postDesc.length}/2500 ký tự
                </span>
              </label>
              <textarea 
                name="postDesc" rows="5" required maxLength={2500}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm mt-1"
                value={formData.postDesc} onChange={handleChange}
                placeholder="Mô tả chi tiết về yêu cầu công việc..."
              ></textarea>
            </div>

            {/* Kỹ năng yêu cầu */}
            <div className="col-span-1 md:col-span-2">
              <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Kỹ Năng Yêu Cầu</label>
              <div className="flex gap-2 mb-3">
                <select 
                  value={selectedSkillId} 
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
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
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> Thêm
                </button>
              </div>
              
              {/* Selected Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map(skill => (
                  <div 
                    key={skill.SkillID}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <span>{skill.skillName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.SkillID)}
                      className="text-blue-500 hover:text-blue-800 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition-colors duration-200">Hủy bỏ</button>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
              {isEditMode ? 'Lưu Cập Nhật' : 'Đăng Tin Ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostingFormModal;