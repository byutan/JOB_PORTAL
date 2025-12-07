/**
 * SERVICE LAYER
 * Chịu trách nhiệm gọi API Backend.
 * Nếu backend đổi URL, chỉ cần sửa ở đây.
 */
const API_BASE_URL = 'http://localhost:3000/api/postings';

export const postingService = {
  // Lấy danh sách tin tuyển dụng
  getAll: async () => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Không thể tải dữ liệu');
    return res.json();
  },

  // Tạo tin mới
  create: async (data) => {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi tạo tin');
    return result;
  },

  // Cập nhật tin (Chỉ gửi các trường cho phép sửa)
  update: async (id, data) => {
    const payload = {
      postDesc: data.postDesc,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      endDate: data.endDate
    };

    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi cập nhật');
    return result;
  },

  // Xóa tin
  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi xóa');
    return result;
  }
  ,
  // Lấy 1 posting theo ID
  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Không thể tải posting');
    return res.json();
  },

  // Lấy danh sách applies cho posting
  getApplies: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/applies`);
    if (!res.ok) throw new Error('Không thể tải danh sách ứng tuyển');
    return res.json();
  }
};