import React from 'react';
import { X } from 'lucide-react';

const AppliesModal = ({ isOpen, onClose, applies, onViewCandidate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl mt-12">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Danh sách ứng tuyển</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
        </div>

        <div className="p-4">
          {(!applies || applies.length === 0) && <div className="text-sm text-slate-500">Chưa có ứng viên ứng tuyển.</div>}

          <ul className="space-y-3">
            {applies && applies.map(a => (
              <li key={`${a.CandidateID}_${a.postID}`} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.fullName || a.userEmail || `Ứng viên #${a.CandidateID}`}</div>
                  <div className="text-xs text-slate-500">Email: {a.userEmail || '-' } • Apply date: {new Date(a.applyDate).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onViewCandidate(a.CandidateID)} className="px-3 py-1 bg-blue-600 text-white rounded">Xem hồ sơ</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppliesModal;
