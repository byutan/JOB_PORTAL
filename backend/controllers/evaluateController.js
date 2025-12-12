const pool = require("../config/db");

exports.evaluateProfileStrength = async (req, res) => {
    const candidateId = req.query.candidate_id;

    if (!candidateId) {
        return res.status(400).json({ error: "candidate_id is required" });
    }

    try {
        // Gọi function từ MySQL
        const sql = "SELECT evaluate_profile_strength(?) AS score";
        const [rows] = await pool.query(sql, [candidateId]);

        const score = rows[0].score;

        // --- NEW: Phân loại nhận xét ---
        let advice = "";

        if (score < 5) {
            advice = "Hồ sơ còn yếu. Bạn nên bổ sung kỹ năng và kinh nghiệm.";
        } else if (score < 10) {
            advice = "Hồ sơ trung bình. Cần cải thiện thêm một số kỹ năng.";
        } else if (score < 15) {
            advice = "Hồ sơ khá tốt. Tiếp tục phát huy!";
        } else {
            advice = "Hồ sơ rất mạnh! Cơ hội được tuyển rất cao.";
        }

        return res.json({
            candidate_id: candidateId,
            score: score,
            advice: advice   // 🔵 thêm kết quả nhận xét
        });

    } catch (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: "Database error" });
    }
};
