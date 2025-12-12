const API_BASE = 'http://localhost:3000/api/candidates';

export const candidateService = {
  // Get candidate profile, optional employerId to filter CV access
  getProfile: async (candidateId, employerId = null) => {
    const url = new URL(`${API_BASE}/${candidateId}`);
    if (employerId) url.searchParams.set('employerId', employerId);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (error) {
      console.error(`Error loading candidate profile for ID ${candidateId}:`, error);
      throw new Error(`Không thể tải profile ứng viên: ${error.message}`);
    }
  },
  updateProfile: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (error) {
      console.error(`Error updating candidate profile:`, error);
      throw new Error(`Cập nhật profile thất bại: ${error.message}`);
    }
  }
  ,
  updateFullProfile: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/full`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (error) {
      console.error(`Error updating full candidate profile:`, error);
      throw new Error(`Cập nhật profile thất bại: ${error.message}`);
    }
  }
};
