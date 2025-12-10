import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, AlertCircle, X } from 'lucide-react';

// --- IMPORT CÁC MODULE BẠN ĐÃ TẠO ---
// Đảm bảo các file này nằm đúng thư mục như đã cấu trúc
import { postingService } from './services/postingService';
import { candidateService } from './services/candidateService';
import PostingFormModal from './components/PostingFormModal';
import PostingTable from './components/PostingTable';
import AppliesModal from './components/AppliesModal';
import ApplyModal from './components/ApplyModal';
import CandidateProfileModal from './components/CandidateProfileModal';
import CandidatesListModal from './components/CandidatesListModal';
import SkillMatchingCard from './components/SkillMatchingCard';
import StatisticsDashboard from './components/StatisticsDashboard';

// --- Component Thông báo (Notification) ---
// (Dùng nội bộ trong App để hiển thị kết quả thao tác)
const Notification = ({ type, message, onClose }) => {
  if (!message) return null;
  
  const styles = type === 'success' 
    ? 'bg-green-50 text-green-700 border-green-200' 
    : 'bg-red-50 text-red-700 border-red-200';
  
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg border shadow-lg animate-fade-in-down ${styles}`}>
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
    </div>
  );
};

const App = () => {
  // --- STATE MANAGEMENT ---
  const [postings, setPostings] = useState([]); // Dữ liệu danh sách tin
  const [loading, setLoading] = useState(true); // Trạng thái tải trang
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở Form Modal
  const [editingItem, setEditingItem] = useState(null); // Item đang được sửa (null = tạo mới)
  const [appliesModalOpen, setAppliesModalOpen] = useState(false);
  const [appliesData, setAppliesData] = useState([]);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedPostingForApply, setSelectedPostingForApply] = useState(null);
  const [candidateProfileOpen, setCandidateProfileOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [notify, setNotify] = useState({ type: '', message: '' }); // Thông báo Toast
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
  // New states for new components
  const [candidatesListOpen, setCandidatesListOpen] = useState(false);
  const [selectedPostingForCandidates, setSelectedPostingForCandidates] = useState(null);
  const [skillMatchingOpen, setSkillMatchingOpen] = useState(false);
  const [selectedPostingForSkills, setSelectedPostingForSkills] = useState(null);
  const [statisticsDashboardOpen, setStatisticsDashboardOpen] = useState(false);

  // --- 1. LOAD DATA (READ) ---
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await postingService.getAll();
      setPostings(data);
    } catch {
      showNotify('error', 'Không thể kết nối đến Server (Kiểm tra lại Backend)');
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị thông báo tự tắt sau 3s
  const showNotify = (type, message) => {
    setNotify({ type, message });
    setTimeout(() => setNotify({ type: '', message: '' }), 3000);
  };

  // --- 2. XỬ LÝ SUBMIT (CREATE / UPDATE) ---
  const handleCreateOrUpdate = async (formData) => {
    // Validate phía Client (Logic cơ bản)
    if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      showNotify('error', 'Lương tối thiểu không được lớn hơn lương tối đa!');
      return;
    }

    try {
      let result;
      if (editingItem) {
        // Gọi Service cập nhật
        result = await postingService.update(editingItem.postID, formData);
      } else {
        // Gọi Service tạo mới
        result = await postingService.create(formData);
      }
      
      showNotify('success', result.message || 'Thao tác thành công');
      setIsModalOpen(false); // Đóng modal
      setEditingItem(null); // Reset trạng thái
      loadData(); // Tải lại bảng dữ liệu mới nhất
    } catch (err) {
      showNotify('error', err.message);
    }
  };

  // --- 3. XỬ LÝ XÓA (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này không?')) return;
    try {
      const result = await postingService.delete(id);
      showNotify('success', result.message);
      loadData(); // Tải lại bảng sau khi xóa
    } catch (err) {
      showNotify('error', err.message);
    }
  };

  // --- XEM DANH SÁCH ỨNG TUYỂN CHO 1 POSTING ---
  const handleViewApplies = async (postId) => {
    try {
      setCurrentPostId(postId);
      const data = await postingService.getApplies(postId);
      setAppliesData(data);
      setAppliesModalOpen(true);
    } catch (err) {
      showNotify('error', err.message);
    }
  };

  // --- XEM PROFILE ỨNG VIÊN ---
  const handleViewCandidateProfile = async (candidateId) => {
    try {
      // close applies modal when opening candidate profile
      setAppliesModalOpen(false);
      setCandidateLoading(true);
      // Optionally pass employerId if logged-in employer; omitted for demo
      const profile = await candidateService.getProfile(candidateId);
      setCandidateProfile(profile);
      setCandidateProfileOpen(true);
    } catch (err) {
      showNotify('error', err.message);
    } finally {
      setCandidateLoading(false);
    }
  };

  // --- OPEN APPLY MODAL ---
  const handleOpenApplyModal = (posting) => {
    setSelectedPostingForApply(posting);
    setApplyModalOpen(true);
  };

  // --- AFTER APPLY SUCCESS, RELOAD DATA ---
  const handleApplySuccess = () => {
    loadData();
  };

  // --- OPEN CANDIDATES LIST MODAL ---
  const handleOpenCandidatesListModal = (posting) => {
    setSelectedPostingForCandidates(posting);
    setCandidatesListOpen(true);
  };

  // --- OPEN SKILL MATCHING MODAL ---
  const handleOpenSkillMatchingModal = (posting) => {
    setSelectedPostingForSkills(posting);
    setSkillMatchingOpen(true);
  };

  // --- CÁC HÀM ĐIỀU KHIỂN UI ---
  const openCreateModal = () => {
    setEditingItem(null); // Đặt về null để Form biết là đang Tạo mới
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item); // Truyền dữ liệu cũ vào để Form hiển thị lên
    setIsModalOpen(true);
  };

  // --- LOGIC TÌM KIẾM ---
  const filteredPostings = postings.filter(p => 
    p.postName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- GIAO DIỆN CHÍNH (RENDER) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Hiển thị thông báo Toast */}
      <Notification 
        type={notify.type} 
        message={notify.message} 
        onClose={() => setNotify({ type: '', message: '' })} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header: Tiêu đề & Nút thêm mới */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hệ Thống Tuyển Dụng</h1>
            <p className="text-slate-500 mt-1">Quản lý các tin đăng và trạng thái ứng tuyển</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setStatisticsDashboardOpen(true)} 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center shadow-lg shadow-indigo-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Thống Kê
            </button>
            <button 
              onClick={openCreateModal} 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center shadow-lg shadow-blue-200"
            >
              <Plus size={20} className="mr-2" />
              Đăng Tin Mới
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tiêu đề hoặc vị trí..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng dữ liệu (Sử dụng component PostingTable) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <PostingTable 
            data={filteredPostings} 
            loading={loading} 
            onEdit={openEditModal} 
            onDelete={handleDelete} 
            onViewApplies={handleViewApplies}
            onApply={handleOpenApplyModal}
            onViewCandidates={handleOpenCandidatesListModal}
            onViewSkillMatching={handleOpenSkillMatchingModal}
          />
        </div>
        
        {/* Footer info */}
        <div className="mt-4 text-center text-xs text-slate-400">
          Hiển thị {filteredPostings.length} bản ghi
        </div>
      </div>

      {/* Form Modal (Sử dụng component PostingFormModal) */}
      <PostingFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
      />

      {/* Applies Modal */}
      <AppliesModal isOpen={appliesModalOpen} onClose={() => setAppliesModalOpen(false)} applies={appliesData} onViewCandidate={handleViewCandidateProfile} postId={currentPostId} />

      {/* Apply Modal (Candidate applying for a job) */}
      <ApplyModal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} posting={selectedPostingForApply} onSuccess={handleApplySuccess} />

      {/* Candidate Profile Modal */}
      <CandidateProfileModal isOpen={candidateProfileOpen} onClose={() => setCandidateProfileOpen(false)} profile={candidateProfile} isLoading={candidateLoading} />

      {/* Candidates List Modal */}
      <CandidatesListModal isOpen={candidatesListOpen} onClose={() => setCandidatesListOpen(false)} posting={selectedPostingForCandidates} onViewProfile={handleViewCandidateProfile} />

      {/* Skill Matching Card Modal */}
      <SkillMatchingCard isOpen={skillMatchingOpen} onClose={() => setSkillMatchingOpen(false)} posting={selectedPostingForSkills} />

      {/* Statistics Dashboard Modal */}
      <StatisticsDashboard isOpen={statisticsDashboardOpen} onClose={() => setStatisticsDashboardOpen(false)} postings={postings} />

      {/* Style Animation cho Notification */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;