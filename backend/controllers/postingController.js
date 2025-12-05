const pool = require('../config/db');

// 1. Lấy danh sách tin (GET)
const getAllPostings = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Posting ORDER BY postID DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Tạo tin mới (POST) - Gọi sp_CreatePosting
const createPosting = async (req, res) => {
    const { 
        postName, salaryMin, salaryMax, position, 
        location, workForm, endDate, domain, postDesc, 
        EmployerID, ModStaffID 
    } = req.body;

    try {
        const sql = `CALL sp_CreatePosting(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [postName, salaryMin, salaryMax, position, location, workForm, endDate, domain, postDesc, EmployerID, ModStaffID];

        const [result] = await pool.execute(sql, values);
        
        res.status(201).json({ 
            success: true, 
            message: result[0][0].Message 
        });
    } catch (error) {
        console.error("Lỗi tạo tin:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// 3. Cập nhật tin (PUT) - Gọi sp_UpdatePosting
const updatePosting = async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const { postDesc, salaryMin, salaryMax, endDate } = req.body;

    try {
        const sql = `CALL sp_UpdatePosting(?, ?, ?, ?, ?)`;
        const values = [id, postDesc, salaryMin, salaryMax, endDate];

        const [result] = await pool.execute(sql, values);

        res.status(200).json({ 
            success: true, 
            message: result[0][0].Message 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 4. Xóa tin (DELETE) - Gọi sp_DeletePosting
const deletePosting = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `CALL sp_DeletePosting(?)`;
        await pool.execute(sql, [id]);

        res.status(200).json({ 
            success: true, 
            message: `Đã xóa tin tuyển dụng ID ${id}` 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAllPostings,
    createPosting,
    updatePosting,
    deletePosting
};