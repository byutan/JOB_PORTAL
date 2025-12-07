const pool = require('../config/db');

// 1. Lấy danh sách tin (GET)
const getAllPostings = async (req, res) => {
    try {
        const sql = `SELECT p.*, e.repCompanyName AS repCompanyName, co.companyName AS companyName
                     FROM Posting p
                     LEFT JOIN Employer e ON p.EmployerID = e.EmployerID
                     LEFT JOIN Company co ON e.companyID = co.companyID
                     ORDER BY p.postID DESC`;
        const [rows] = await pool.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 1b. Lấy 1 tin theo ID (GET /:id)
const getPostingById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT p.*, e.repCompanyName AS repCompanyName, co.companyName AS companyName
                     FROM Posting p
                     LEFT JOIN Employer e ON p.EmployerID = e.EmployerID
                     LEFT JOIN Company co ON e.companyID = co.companyID
                     WHERE p.postID = ?`;
        const [rows] = await pool.execute(sql, [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: `Posting ID ${id} not found` });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 1c. Lấy danh sách apply cho 1 posting (GET /:id/applies)
// Supports query params: ?search=name_or_email&filter=all|recent|older
const getAppliesByPosting = async (req, res) => {
    const { id } = req.params;
    const { search = '', filter = 'all' } = req.query;

    try {
        const sql = `
            SELECT a.*, c.*, u.fullName AS fullName, u.emailAddr AS userEmail
            FROM Applies a
            LEFT JOIN Candidate c ON a.CandidateID = c.CandidateID
            LEFT JOIN ` + '`User`' + ` u ON c.CandidateID = u.userID
            WHERE a.PostID = ?
        `;

        const [rows] = await pool.execute(sql, [id]);

        // Sort by detected apply-date column (descending) so the latest applies come first
        const dateKeys = ['applyDate', 'ApplyDate', 'apply_on', 'applyOn', 'createdAt', 'createDate', 'appliedAt', 'applyAt'];
        let dateKeyFound = null;
        if (rows && rows.length > 0) {
            for (const k of dateKeys) {
                if (Object.prototype.hasOwnProperty.call(rows[0], k)) {
                    dateKeyFound = k;
                    break;
                }
            }
        }
        if (dateKeyFound) {
            rows.sort((a, b) => new Date(b[dateKeyFound]) - new Date(a[dateKeyFound]));
        }

        // Deduplicate: keep only the first (latest) apply per candidate/email.
        const dedupMap = {};
        const applyIdKeys = ['ApplyID', 'applyID', 'applyId', 'applyid', 'id'];
        const findApplyId = (r) => {
            for (const k of applyIdKeys) if (Object.prototype.hasOwnProperty.call(r, k)) return r[k];
            return undefined;
        };

        rows.forEach(row => {
            const idKey = row.CandidateID ? `id:${row.CandidateID}` : null;
            const emailKey = row.userEmail ? `email:${String(row.userEmail).toLowerCase()}` : null;
            const applyId = findApplyId(row);
            const key = idKey || emailKey || (applyId ? `apply:${applyId}` : `row:${Math.random()}`);
            if (!dedupMap[key]) {
                dedupMap[key] = row;
            }
        });
        let deduped = Object.values(dedupMap);

        // Server-side search: filter by fullName or emailAddr
        let filtered = deduped;
        if (search && search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(a => {
                const name = (a.fullName || '').toLowerCase();
                const email = (a.userEmail || '').toLowerCase();
                return name.includes(searchLower) || email.includes(searchLower);
            });
        }

        // Server-side filter: by recency (recent = last 24h, older = older than 24h)
        if (filter !== 'all') {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            filtered = filtered.filter(a => {
                const applyDateField = a.applyDate || a.applyOn || a.createdAt || a.createDate;
                if (!applyDateField) return true;

                const applyDate = new Date(applyDateField);
                if (filter === 'recent') {
                    return applyDate >= oneDayAgo;
                } else if (filter === 'older') {
                    return applyDate < oneDayAgo;
                }
                return true;
            });
        }

        // filtered is already in descending apply-date order because rows were
        // sorted earlier before deduplication. No need to re-detect/sort here.

        res.status(200).json(filtered);
    } catch (error) {
        console.error('Lỗi lấy applies:', error.message);
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
        // Basic server-side validation to avoid DB CHECK violations
        if (salaryMin == null || salaryMax == null) {
            return res.status(400).json({ success: false, error: 'salaryMin và salaryMax là bắt buộc' });
        }
        const min = Number(salaryMin);
        const max = Number(salaryMax);
        if (Number.isNaN(min) || Number.isNaN(max)) {
            return res.status(400).json({ success: false, error: 'salaryMin/salaryMax phải là số' });
        }
        if (min < 0 || max < 0) {
            return res.status(400).json({ success: false, error: 'Lương không được âm' });
        }
        if (max < min) {
            return res.status(400).json({ success: false, error: 'salaryMax phải lớn hơn hoặc bằng salaryMin' });
        }
        // If ModStaffID not provided or invalid, pick a default ModeratorStaff
        let modId = ModStaffID;
        if (!modId) {
            const [mods] = await pool.execute('SELECT StaffID FROM ModeratorStaff LIMIT 1');
            if (mods && mods.length > 0) modId = mods[0].StaffID;
        } else {
            const [exists] = await pool.execute('SELECT 1 FROM ModeratorStaff WHERE StaffID = ?', [modId]);
            if (!exists || exists.length === 0) {
                const [mods] = await pool.execute('SELECT StaffID FROM ModeratorStaff LIMIT 1');
                if (mods && mods.length > 0) modId = mods[0].StaffID;
            }
        }

        const sql = `CALL sp_CreatePosting(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [postName, salaryMin, salaryMax, position, location, workForm, endDate, domain, postDesc, EmployerID, modId];

        const [result] = await pool.execute(sql, values);
        
        res.status(201).json({ 
            success: true, 
            message: result[0][0].Message 
        });
    } catch (error) {
        console.error("Lỗi tạo tin:", error.message);
        // Map DB CHECK constraint failures to friendly messages
        if (error.message && error.message.indexOf && error.message.indexOf('chk_salary_vnd') !== -1) {
            return res.status(400).json({ success: false, error: 'Mức lương không thỏa mãn quy định của hệ thống (kiểm tra currency/minimum).' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// 3. Cập nhật tin (PUT) - Gọi sp_UpdatePosting
const updatePosting = async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const { postDesc, salaryMin, salaryMax, endDate } = req.body;

    try {
        // Server-side validation similar to create
        if (salaryMin == null || salaryMax == null) {
            return res.status(400).json({ success: false, error: 'salaryMin và salaryMax là bắt buộc' });
        }
        const min = Number(salaryMin);
        const max = Number(salaryMax);
        if (Number.isNaN(min) || Number.isNaN(max)) {
            return res.status(400).json({ success: false, error: 'salaryMin/salaryMax phải là số' });
        }
        if (min < 0 || max < 0) {
            return res.status(400).json({ success: false, error: 'Lương không được âm' });
        }
        if (max < min) {
            return res.status(400).json({ success: false, error: 'salaryMax phải lớn hơn hoặc bằng salaryMin' });
        }
        // Disallow editing if the posting has already expired
        const [postingRows] = await pool.execute('SELECT endDate FROM Posting WHERE postID = ?', [id]);
        if (!postingRows || postingRows.length === 0) {
            return res.status(404).json({ success: false, error: `Posting ID ${id} not found` });
        }
        const dbEnd = postingRows[0].endDate;
        if (dbEnd) {
            const end = new Date(dbEnd);
            // treat endDate as inclusive full day: set to end of day
            end.setHours(23, 59, 59, 999);
            const now = new Date();
            if (now > end) {
                return res.status(403).json({ success: false, error: 'Tin tuyển dụng đã hết hạn, không thể chỉnh sửa.' });
            }
        }

        const sql = `CALL sp_UpdatePosting(?, ?, ?, ?, ?)`;
        const values = [id, postDesc, salaryMin, salaryMax, endDate];

        const [result] = await pool.execute(sql, values);

        res.status(200).json({ 
            success: true, 
            message: result[0][0].Message 
        });
    } catch (error) {
        if (error.message && error.message.indexOf && error.message.indexOf('chk_salary_vnd') !== -1) {
            return res.status(400).json({ success: false, error: 'Mức lương không thỏa mãn quy định của hệ thống (kiểm tra currency/minimum).' });
        }
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
    getPostingById,
    getAppliesByPosting,
    createPosting,
    updatePosting,
    deletePosting
};