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

  // Lấy danh sách applies cho posting với search/filter support
  // params: { search?: string, filter?: 'all' | 'recent' | 'older' }
  getApplies: async (postId, params = {}) => {
    const url = new URL(`${API_BASE_URL}/${postId}/applies`);
    if (params.search) url.searchParams.append('search', params.search);
    if (params.filter) url.searchParams.append('filter', params.filter);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Không thể tải danh sách ứng tuyển');
    return res.json();
  },

  // Ứng viên ứng tuyển cho tin (POST)
  applyToPosting: async (postId, candidateID) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateID: parseInt(candidateID) }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi ứng tuyển');
    return result;
  },

  // Lấy danh sách ứng viên cho posting (từ stored procedure)
  getCandidatesByPosting: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/candidates`);
    if (!res.ok) throw new Error('Không thể tải danh sách ứng viên');
    return res.json();
  },

  // Lấy thống kê kỹ năng cho posting (từ stored procedure)
  getSkillAnalysis: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/skill-analysis`);
    if (!res.ok) throw new Error('Không thể tải phân tích kỹ năng');
    return res.json();
  },

  // Apply as new candidate (create user + candidate + apply in one step)
  applyAsNewCandidate: async (data) => {
    const res = await fetch('http://localhost:3000/api/candidates/apply-new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi ứng tuyển');
    return result;
  }
};