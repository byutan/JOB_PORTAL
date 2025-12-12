import React from 'react';
import { X, Loader2 } from 'lucide-react';

const CandidateProfileModal = ({ isOpen, onClose, profile, isLoading = false }) => {
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
          <Loader2 className="animate-spin mb-3" size={36} />
          <div className="text-sm text-slate-600">Đang tải hồ sơ ứng viên...</div>
        </div>
      </div>
    );
  }

  const { candidate, cvs = [], experiences = [], education = [], certificates = [], skills = [] } = profile || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl mt-12">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Hồ sơ ứng viên</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header: Name & Basic Info */}
          <div>
            <div className="text-2xl font-bold">{candidate?.fullName || candidate?.userEmail || `Ứng viên #${candidate?.CandidateID}`}</div>
            <div className="text-sm text-slate-600 mt-1">{candidate?.currentTitle} • {candidate?.totalYearOfExp} năm kinh nghiệm</div>
            <div className="mt-2 text-sm text-slate-700 leading-relaxed">{candidate?.selfIntro}</div>
          </div>

          {/* CVs Section */}
          <div>
            <h4 className="font-semibold text-base mb-3">CVs</h4>
            {cvs.length === 0 ? (
              <div className="text-sm text-slate-500">Không có CV công khai.</div>
            ) : (
              <div className="space-y-3">
                {cvs.map(cv => (
                  <div key={cv.cvID} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{cv.cvName || `CV #${cv.cvID}`}</div>
                        <div className="text-xs text-slate-500 mt-1">Mục tiêu: -</div>
                      </div>
                      <a 
                        className="text-blue-600 text-sm hover:underline font-medium ml-2" 
                        href={cv.cvURL || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        Tải về
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience & Education/Certificates in 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div>
              <h4 className="font-semibold text-base mb-3">Kinh nghiệm</h4>
              {experiences.length === 0 ? (
                <div className="text-sm text-slate-500">Không có kinh nghiệm công khai.</div>
              ) : (
                <div className="space-y-3">
                  {experiences.map(e => (
                    <div key={`${e.CandidateID}_${e.expID}`} className="p-4 border border-slate-200 rounded-lg">
                      <div className="font-medium text-slate-900">{e.jobTitle} •</div>
                      <div className="text-xs text-slate-600">{e.CompanyName || e.companyName || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {e.startDate ? `${new Date(e.startDate).toLocaleDateString('vi-VN')} - ` : ''}
                        {e.endDate ? new Date(e.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                      </div>
                      {e.expDesc && <div className="mt-2 text-xs text-slate-700">{e.expDesc}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education & Certificates */}
            <div>
              <h4 className="font-semibold text-base mb-3">Học vấn & Chứng chỉ</h4>
              <div className="space-y-3">
                {education.length === 0 && certificates.length === 0 ? (
                  <div className="text-sm text-slate-500">Không có thông tin học vấn và chứng chỉ.</div>
                ) : (
                  <>
                    {education.map(ed => (
                      <div key={`${ed.CandidateID}_${ed.eduID}`} className="p-4 border border-slate-200 rounded-lg">
                        <div className="font-medium text-slate-900">{ed.schoolName} • {ed.degree}</div>
                        <div className="text-xs text-slate-600 mt-1">{ed.major} — {ed.startDate ? new Date(ed.startDate).getFullYear() : ''} - {ed.endDate ? new Date(ed.endDate).getFullYear() : ''}</div>
                      </div>
                    ))}
                    {certificates.map(c => (
                      <div key={`${c.CandidateID}_${c.certID}`} className="p-4 border border-slate-200 rounded-lg">
                        <div className="font-medium text-slate-900">{c.certName}</div>
                        <div className="text-xs text-slate-600 mt-1">Cấp ngày: {c.issueDate ? new Date(c.issueDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h4 className="font-semibold text-base mb-3">Kỹ năng</h4>
            {skills.length === 0 ? (
              <div className="text-sm text-slate-500">Không có kỹ năng công khai.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span 
                    key={s.skillID || s} 
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-700 font-medium"
                  >
                    {typeof s === 'string' ? s : (s.skillName || s.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
