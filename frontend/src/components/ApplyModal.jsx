import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { postingService } from '../services/postingService';
import { candidateService } from '../services/candidateService';

/**
 * ApplyModal: Modal cho phép ứng viên submit application cho một job posting
 * Hiển thị thông tin ứng viên dưới dạng form trước khi ứng tuyển
 */
const ApplyModal = ({ isOpen, onClose, posting, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Confirm & Apply
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddr: '',
    phoneNumber: '',
    password: '',
    sex: 'Nam',
    birthDate: '',
    address: '',
    currentTitle: '',
    selfIntro: '',
    totalYearOfExp: 0
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Step 1: Validate and proceed to confirm
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

    setStep(2);
  };

  // Step 2: Submit application
  const handleSubmitApplication = async () => {
    setError('');
    setSubmitting(true);

    try {
      const response = await postingService.applyAsNewCandidate({
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

  const handleGoBack = () => {
    setStep(1);
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
      totalYearOfExp: 0
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kinh Nghiệm (năm)</label>
                  <input
                    type="number"
                    value={formData.totalYearOfExp}
                    onChange={(e) => handleFormChange('totalYearOfExp', e.target.value)}
                    min="0"
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
          ) : (
            // Step 2: Confirm Information
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Xác Nhận Thông Tin</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-600">Họ tên:</p><p className="font-medium text-slate-900">{formData.fullName}</p></div>
                  <div><p className="text-slate-600">Email:</p><p className="font-medium text-slate-900">{formData.emailAddr}</p></div>
                  <div><p className="text-slate-600">Số điện thoại:</p><p className="font-medium text-slate-900">{formData.phoneNumber}</p></div>
                  <div><p className="text-slate-600">Vị trí:</p><p className="font-medium text-slate-900">{formData.currentTitle || 'N/A'}</p></div>
                  <div><p className="text-slate-600">Địa chỉ:</p><p className="font-medium text-slate-900">{formData.address}</p></div>
                  <div><p className="text-slate-600">Kinh nghiệm:</p><p className="font-medium text-slate-900">{formData.totalYearOfExp} năm</p></div>
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
              disabled={submitting || loading}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            {step === 1 && (
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp Tục
              </button>
            )}
            {step === 2 && (
              <>
                <button
                  onClick={handleGoBack}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Đang ứng tuyển...' : 'Xác Nhận Ứng Tuyển'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
