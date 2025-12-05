import React from 'react';
import { Edit2, Trash2, Loader2 } from 'lucide-react';

/**
 * COMPONENT: Table Display
 * Hiển thị danh sách tin tuyển dụng
 */
const PostingTable = ({ data, loading, onEdit, onDelete }) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
            <th className="p-4 w-16">ID</th>
            <th className="p-4">Vị trí / Tiêu đề</th>
            <th className="p-4">Mức lương (VND)</th>
            <th className="p-4">Thời hạn</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-center w-32">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((post) => {
            const isExpired = new Date(post.endDate) < new Date();
            return (
              <tr key={post.postID} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 text-slate-400 font-mono text-sm">#{post.postID}</td>
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{post.postName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{post.position} • {post.location}</div>
                </td>
                <td className="p-4 text-slate-700 font-medium text-sm">
                  {parseInt(post.salaryMin).toLocaleString()} - {parseInt(post.salaryMax).toLocaleString()}
                </td>
                <td className="p-4 text-slate-600 text-sm">
                  {new Date(post.endDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isExpired ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isExpired ? 'Đã hết hạn' : 'Đang tuyển'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(post)} className="p-2 rounded-md transition-colors duration-200 text-blue-600 bg-blue-50 hover:bg-blue-100" title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(post.postID)} className="p-2 rounded-md transition-colors duration-200 text-red-600 bg-red-50 hover:bg-red-100" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PostingTable;