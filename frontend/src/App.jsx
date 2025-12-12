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
import CandidateAvailablePostingsModal from './components/CandidateAvailablePostingsModal';
import CandidateStrengthModal from './components/CandidateStrengthModal';
import CandidateProfileEditModal from './components/CandidateProfileEditModal';


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
  const [strengthOpen, setStrengthOpen] = useState(false);
  // New states for new components
  const [candidatesListOpen, setCandidatesListOpen] = useState(false);
  const [selectedPostingForCandidates, setSelectedPostingForCandidates] = useState(null);
  const [candidateAvailablePostingsOpen, setCandidateAvailablePostingsOpen] = useState(false);
  const [candidateID, setCandidateID] = useState(''); // ID của ứng viên
  const [candidateInputError, setCandidateInputError] = useState(''); // Lỗi khi nhập ID
  const [profileEditOpen, setProfileEditOpen] = useState(false); // Trạng thái modal chỉnh sửa profile

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
    // Show success message
    showNotify('success', 'Ứng tuyển thành công!');
  };

  // --- OPEN CANDIDATES LIST MODAL ---
  const handleOpenCandidatesListModal = (posting) => {
    setSelectedPostingForCandidates(posting);
    setCandidatesListOpen(true);
  };

  // --- OPEN CANDIDATE AVAILABLE POSTINGS MODAL ---
  const handleOpenCandidateAvailablePostings = () => {
    setCandidateInputError('');
    
    if (!candidateID || candidateID.trim() === '') {
      setCandidateInputError('Vui lòng nhập ID ứng viên');
      return;
    }
    
    if (isNaN(candidateID) || parseInt(candidateID) <= 0) {
      setCandidateInputError('ID ứng viên phải là một số dương');
      return;
    }
    
    setCandidateAvailablePostingsOpen(true);
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
          <div className="flex gap-3 w-fit">
            <button
              onClick={() => setStrengthOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center shadow-lg shadow-purple-200"
            >
            <span className="ml-2">Đánh Giá Hồ Sơ</span>
            </button>
            <button
              onClick={() => setProfileEditOpen(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center shadow-lg shadow-purple-200"
            >
            <span className="ml-2">Chỉnh Sửa Profile</span>
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

        {/* Thanh nhập ID ứng viên */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl shadow-sm border border-emerald-200 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nhập ID Ứng Viên Để Tìm Việc Làm</label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input 
                type="number" 
                placeholder="Nhập ID ứng viên (vd: 1, 2, 3...)" 
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all outline-none ${
                  candidateInputError 
                    ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
                value={candidateID}
                onChange={(e) => {
                  setCandidateID(e.target.value);
                  setCandidateInputError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleOpenCandidateAvailablePostings();
                  }
                }}
              />
              {candidateInputError && (
                <p className="text-red-600 text-sm mt-2 font-medium"> {candidateInputError}</p>
              )}
            </div>
            <button 
              onClick={handleOpenCandidateAvailablePostings}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center shadow-lg shadow-emerald-200 mt-0.5 whitespace-nowrap"
            >
              <Search size={18} className="mr-2" />
              Tìm Việc
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2"> Hãy nhập ID ứng viên của bạn từ database để bắt đầu tìm kiếm công việc</p>
        </div>

        {/* Thanh tìm kiếm cho công việc (chỉ cho nhà tuyển dụng) */}
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

      {/* Candidates List Modal (includes statistics) */}
      <CandidatesListModal isOpen={candidatesListOpen} onClose={() => setCandidatesListOpen(false)} posting={selectedPostingForCandidates} onViewProfile={handleViewCandidateProfile} />

      {/* Candidate Available Postings Modal */}
      <CandidateAvailablePostingsModal 
        isOpen={candidateAvailablePostingsOpen} 
        onClose={() => setCandidateAvailablePostingsOpen(false)} 
        candidateID={parseInt(candidateID)}
        onApplySuccess={handleApplySuccess}
      />

      {/* Candidate Strength Modal */}
      <CandidateStrengthModal 
        isOpen={strengthOpen}
        onClose={() => setStrengthOpen(false)}
        onViewProfile={handleViewCandidateProfile}
      />

      {/* Candidate Profile Edit Modal */}
      <CandidateProfileEditModal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        onSuccess={() => loadData()}
      />



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