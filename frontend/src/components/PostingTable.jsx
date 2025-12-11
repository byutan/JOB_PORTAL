import React, { useState } from 'react';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import PostingDetailModal from './PostingDetailModal';

/**
 * COMPONENT: Table Display
 * Hiển thị danh sách tin tuyển dụng
 */
const PostingTable = ({ data, loading, onEdit, onDelete, onApply, onViewCandidates }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center text-gray-400">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="p-12 text-center text-gray-500">Chưa có tin tuyển dụng nào được tạo.</div>;
  }

  const handleViewDetail = (post) => {
    // open local modal
    setSelectedPost(post);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedPost(null);
  };

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
            <th className="p-4 w-16">Số thứ tự</th>
            <th className="p-4">Vị trí / Tiêu đề</th>
            <th className="p-4">Mức lương (VND)</th>
            <th className="p-4">Thời hạn</th>
            <th className="p-4 text-center w-28">Số ứng viên</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-center w-32">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((post) => {
            const isExpired = new Date(post.endDate) < new Date();
            return (
              <tr 
                key={post.postID} 
                className="hover:bg-blue-50 transition-colors group cursor-pointer"
                onClick={() => onViewCandidates && onViewCandidates(post)}
              >
                <td className="p-4 text-slate-400 font-mono text-sm">#{post.postID}</td>
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{post.postName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{post.position} • {post.location}</div>
                  {post.companyName && <div className="text-xs text-slate-400 mt-0.5">{post.companyName}</div>}

                  {/* Required skills - accepts array or comma/string list from API */}
                  {(() => {
                    const raw = post.requires || post.requiredSkills || post.skills || post.skillNames || post.require || post.required || [];
                    let skills = [];
                    if (Array.isArray(raw)) skills = raw;
                    else if (typeof raw === 'string' && raw.length) skills = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
                    else if (raw && typeof raw === 'object') skills = Object.values(raw).flatMap(v => typeof v === 'string' ? v.split(/[,;|]/).map(s=>s.trim()) : (Array.isArray(v)?v:[]));

                    if (skills.length === 0) return null;

                    return (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.slice(0, 6).map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{s}</span>
                        ))}
                        {skills.length > 6 && <span className="text-xs px-2 py-0.5 text-slate-400">+{skills.length - 6} thêm</span>}
                      </div>
                    );
                  })()}
                </td>
                <td className="p-4 text-slate-700 font-medium text-sm">
                  {parseInt(post.salaryMin).toLocaleString()} - {parseInt(post.salaryMax).toLocaleString()}
                </td>
                <td className="p-4 text-slate-600 text-sm">
                  {new Date(post.endDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4 text-center text-slate-700 font-medium">{post.NumApply ?? post.numApply ?? 0}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isExpired ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isExpired ? 'Đã hết hạn' : 'Đang tuyển'}
                  </span>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => onApply && onApply(post)} className="px-3 py-1.5 rounded-md transition-colors duration-200 text-purple-600 bg-purple-50 hover:bg-purple-100 text-sm font-medium w-28 text-center" title="Ứng tuyển">
                        Ứng tuyển
                      </button>
                      <button onClick={() => handleViewDetail(post)} className="px-3 py-1 rounded-md transition-colors duration-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs w-28 text-center" title="Xem chi tiết">
                        Xem chi tiết
                      </button>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => onEdit(post)} className="p-2 rounded-md transition-colors duration-200 text-blue-600 bg-blue-50 hover:bg-blue-100" title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(post.postID)} className="p-2 rounded-md transition-colors duration-200 text-red-600 bg-red-50 hover:bg-red-100" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
      {/* Posting detail modal */}
      <PostingDetailModal post={selectedPost} open={detailOpen} onClose={handleCloseDetail} onApply={onApply} />
    </>
  );
};

export default PostingTable;