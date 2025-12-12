import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/evaluate";
// const CandidateStrengthModal = ({ isOpen, onClose }) => {
const CandidateStrengthModal = ({ isOpen, onClose, onViewProfile }) => {
  const [candidateID, setCandidateID] = useState("");
  const [score, setScore] = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const evaluate = async () => {
    setErrorMsg("");
    setScore(null);

    if (!candidateID || parseInt(candidateID) <= 0) {
      setErrorMsg("ID ứng viên phải là số dương");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}?candidate_id=${candidateID}`);
      setScore(res.data.score);
      setAdvice(res.data.advice);
    } catch (err) {
      setErrorMsg("Không thể lấy điểm hồ sơ. Kiểm tra backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">
          Đánh Giá Hồ Sơ Ứng Viên
        </h2>

        <label className="text-sm font-medium text-slate-600">
          Nhập ID ứng viên:
        </label>

        <input
          type="number"
          className="w-full px-4 py-2 rounded-lg border mt-2 mb-3"
          placeholder="VD: 1, 2, 3..."
          value={candidateID}
          onChange={(e) => setCandidateID(e.target.value)}
        />

        {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

        <button
          onClick={() => {
          onViewProfile(candidateID); 
          onClose();   // đóng modal đánh giá hồ sơ
          }}
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm mb-3"
        >
        Xem hồ sơ
        </button>

        <button
          onClick={evaluate}
          className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Đang xử lý..." : "Xem điểm hồ sơ"}
        </button>

        {score !== null && (
          <div className="mt-5 p-3 rounded-lg border bg-slate-50">
            <p className="font-medium text-slate-700 mb-2">Điểm hồ sơ:</p>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-3 rounded-full">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${score}%` }}
              ></div>
            </div>

            <p className="mt-2 text-center text-lg font-semibold">
              {score} / 100
            </p>
          </div>
        )}
        {advice && (
          <p className="mt-3 text-center text-blue-700 font-medium">
          {advice}
           </p>
        )}


        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default CandidateStrengthModal;
