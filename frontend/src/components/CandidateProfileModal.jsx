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

        <div className="p-6 space-y-4">
          <div>
            <div className="text-lg font-bold">{candidate?.fullName || candidate?.userEmail || `Ứng viên #${candidate?.CandidateID}`}</div>
            <div className="text-sm text-slate-500">{candidate?.currentTitle} • {candidate?.totalYearOfExp} năm kinh nghiệm</div>
            <div className="mt-2 text-sm text-slate-700">{candidate?.selfIntro}</div>
          </div>

          <div>
            <h4 className="font-semibold">CVs</h4>
            <ul className="mt-2 space-y-2">
              {cvs.length === 0 && <div className="text-sm text-slate-500">Không có CV công khai.</div>}
              {cvs.map(cv => (
                <li key={cv.cvID} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{cv.title || `CV #${cv.cvID}`}</div>
                    <div className="text-xs text-slate-500">Mục tiêu: {cv.objective || '-'}</div>
                  </div>
                  <a className="text-blue-600 text-sm" href={cv.fileUrl || '#'} target="_blank" rel="noreferrer">Tải về</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Kinh nghiệm</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {experiences.map(e => (
                  <li key={`${e.CandidateID}_${e.expID}`} className="border p-3 rounded">
                    <div className="font-medium">{e.jobTitle} • {e.companyName}</div>
                    <div className="text-xs text-slate-500">{new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}</div>
                    <div className="mt-1 text-sm">{e.jobDesc}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Học vấn & Chứng chỉ</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {education.map(ed => (
                  <li key={`${ed.CandidateID}_${ed.eduID}`} className="border p-3 rounded">
                    <div className="font-medium">{ed.schoolName} • {ed.degree}</div>
                    <div className="text-xs text-slate-500">{ed.major} — {new Date(ed.startDate).getFullYear()} - {new Date(ed.endDate).getFullYear()}</div>
                  </li>
                ))}
                {certificates.map(c => (
                  <li key={`${c.CandidateID}_${c.certID}`} className="border p-3 rounded">
                    <div className="font-medium">{c.certName}</div>
                    <div className="text-xs text-slate-500">Cấp ngày: {new Date(c.issueDate).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Kỹ năng</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s.skillID} className="px-3 py-1 bg-slate-100 rounded-full text-sm">{s.skillName}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
