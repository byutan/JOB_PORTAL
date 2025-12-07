import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    domain: 'IT', postDesc: '', EmployerID: 1, ModStaffID: 7
  };

  const [formData, setFormData] = useState(defaultState);

  // Load dữ liệu khi mở modal hoặc khi initialData thay đổi
  useEffect(() => {
    // schedule the state update to avoid synchronous setState inside effect
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        if (initialData) {
          setFormData({
            ...initialData,
            // Chuyển đổi ngày từ ISO (Backend) sang YYYY-MM-DD (Input Date)
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : ''
          });
        } else {
          setFormData(defaultState);
        }
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề bài đăng</label>
                <input 
                  type="text" name="postName" required
                  disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.postName} onChange={handleChange}
                  placeholder="VD: Senior React Developer"
                />
                {isEditMode && <span className="text-xs text-amber-600 mt-1 block">⚠️ Không thể sửa tiêu đề (Ràng buộc DB)</span>}
              </div>

              <div>
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Vị trí (Position)</label>
                <input 
                  type="text" name="position" required
                  disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                  value={formData.position} onChange={handleChange}
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
                <label className="label-text block text-sm font-semibold text-slate-700 mb-1.5">Địa điểm làm việc</label>
                <input 
                  type="text" name="location" disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                  value={formData.location} onChange={handleChange}
                />
              </div>
            </div>

            {/* Hình thức làm việc */}
            <div className="col-span-1 md:col-span-2">
              <label className="label-text mb-2 block text-sm font-semibold text-slate-700">Hình thức làm việc</label>
              <div className="flex gap-6">
                {['Full-time', 'Part-time', 'Remote', 'Hybrid'].map(type => (
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
                    <span className="ml-2 text-slate-700 group-hover:text-blue-600 text-sm">{type}</span>
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