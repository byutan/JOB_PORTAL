const API_BASE = 'http://localhost:3000/api/candidates';

export const candidateService = {
  // Get candidate profile, optional employerId to filter CV access
  getProfile: async (candidateId, employerId = null) => {
    const url = new URL(`${API_BASE}/${candidateId}`);
    if (employerId) url.searchParams.set('employerId', employerId);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Không thể tải profile ứng viên');
    return res.json();
  }
};
