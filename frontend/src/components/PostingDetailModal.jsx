import React from 'react';

const PostingDetailModal = ({ post, open, onClose, onApply }) => {
  if (!open || !post) return null;

  const {
    postName, position, location, companyName, salaryMin, salaryMax,
    salaryCurrency, salaryPeriod, workForm, createDate, endDate,
    postDesc, NumApply, numApply, requires, requiredSkills, skillNames
  } = post;

  const raw = requires || requiredSkills || skillNames || post.requires || post.skills || [];
  let skills = [];
  if (Array.isArray(raw)) skills = raw;
  else if (typeof raw === 'string' && raw.length) skills = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-3xl p-6 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{postName}</h3>
            <div className="text-sm text-slate-500">{position} • {location}</div>
            {companyName && <div className="text-sm text-slate-400 mt-1">{companyName}</div>}
          </div>
          <div className="text-sm text-slate-500">Hết hạn: {new Date(endDate).toLocaleDateString('vi-VN')}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500">Mức lương</div>
            <div className="font-medium text-slate-800">{salaryMin ? Number(salaryMin).toLocaleString() : '-'} - {salaryMax ? Number(salaryMax).toLocaleString() : '-'} {salaryCurrency} / {salaryPeriod}</div>

            <div className="mt-3 text-xs text-slate-500">Hình thức</div>
            <div className="text-slate-700">{workForm || '—'}</div>

            <div className="mt-3 text-xs text-slate-500">Số ứng dụng</div>
            <div className="text-slate-700">{NumApply ?? numApply ?? 0}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Ngày tạo</div>
            <div className="text-slate-700">{createDate ? new Date(createDate).toLocaleString('vi-VN') : '—'}</div>

            <div className="mt-3 text-xs text-slate-500">Kỹ năng yêu cầu</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {skills.length === 0 ? <span className="text-slate-400">Không có</span> : skills.map((s,i)=>(
                <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-slate-500">Mô tả công việc</div>
          <div className="mt-2 text-slate-700 whitespace-pre-line">{postDesc || 'Chưa có mô tả'}</div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 text-slate-700">Đóng</button>
          <button onClick={() => onApply && onApply(post)} className="px-4 py-2 rounded bg-purple-600 text-white">Ứng tuyển</button>
        </div>
      </div>
    </div>
  );
};

export default PostingDetailModal;
