const pool = require('../config/db');

// 1. Lấy danh sách tin (GET)
const getAllPostings = async (req, res) => {
    try {
                const sql = `SELECT p.*, e.repCompanyName AS repCompanyName, co.companyName AS companyName,
                                                         GROUP_CONCAT(DISTINCT s.skillName SEPARATOR ',') AS requiredSkills
                                         FROM Posting p
                                         LEFT JOIN Employer e ON p.EmployerID = e.EmployerID
                                         LEFT JOIN Company co ON e.companyID = co.companyID
                                         LEFT JOIN \
                                             \`Require\` r ON p.postID = r.postID
                                         LEFT JOIN Skill s ON r.skillID = s.skillID
                                         GROUP BY p.postID
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
        const sql = `SELECT p.*, e.repCompanyName AS repCompanyName, co.companyName AS companyName,
                     GROUP_CONCAT(DISTINCT s.skillName SEPARATOR ',') AS requiredSkills
                 FROM Posting p
                 LEFT JOIN Employer e ON p.EmployerID = e.EmployerID
                 LEFT JOIN Company co ON e.companyID = co.companyID
                 LEFT JOIN \`Require\` r ON p.postID = r.postID
                 LEFT JOIN Skill s ON r.skillID = s.skillID
                 WHERE p.postID = ?
                 GROUP BY p.postID`;
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
            SELECT a.*, c.*, u.fullName AS fullName, u.emailAddr AS userEmail, u.phoneNumber
            FROM Applies a
            LEFT JOIN Candidate c ON a.CandidateID = c.CandidateID
            LEFT JOIN ` + '`User`' + ` u ON c.CandidateID = u.userID
            WHERE a.PostID = ? AND u.userID IS NOT NULL
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
        EmployerID, ModStaffID, requiredSkills = []
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
        
        let postId = null;
        if (result && result[0] && result[0][0]) {
            // Extract postID from procedure result if available
            postId = result[0][0].postID || result[0][0].Post_ID;
        }

        // Insert required skills if provided
        if (postId && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
            const skillIds = requiredSkills.map(skill => 
              typeof skill === 'object' ? skill.SkillID : skill
            ).filter(id => id);
            
            if (skillIds.length > 0) {
                const insertSkillSql = `INSERT INTO \`Require\` (skillID, postID) VALUES ${skillIds.map(() => '(?, ?)').join(', ')}`;
                const insertValues = [];
                skillIds.forEach(id => {
                    insertValues.push(id, postId);
                });
                await pool.execute(insertSkillSql, insertValues);
            }
        }
        
        res.status(201).json({ 
            success: true, 
            message: result[0][0].Message,
            postId: postId
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

// 5. Ứng viên ứng tuyển cho tin (POST /:id/apply)
// Body: { candidateID }
const createApply = async (req, res) => {
    const { id } = req.params; // postID
    const { candidateID } = req.body;

    try {
        // Validate inputs
        if (!candidateID) {
            return res.status(400).json({ success: false, error: 'candidateID là bắt buộc' });
        }

        // Check if posting exists
        const [postRows] = await pool.execute('SELECT postID, endDate FROM Posting WHERE postID = ?', [id]);
        if (!postRows || postRows.length === 0) {
            return res.status(404).json({ success: false, error: `Posting ID ${id} không tồn tại` });
        }

        // Check if posting is expired
        const posting = postRows[0];
        const endDate = new Date(posting.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (new Date() > endDate) {
            return res.status(403).json({ success: false, error: 'Hạn chót ứng tuyển đã hết' });
        }

        // Check if candidate exists
        const [candRows] = await pool.execute('SELECT CandidateID FROM Candidate WHERE CandidateID = ?', [candidateID]);
        if (!candRows || candRows.length === 0) {
            return res.status(404).json({ success: false, error: `Candidate ID ${candidateID} không tồn tại` });
        }

        // Check if already applied
        const [existApply] = await pool.execute(
            'SELECT 1 FROM Applies WHERE CandidateID = ? AND postID = ?',
            [candidateID, id]
        );
        if (existApply && existApply.length > 0) {
            return res.status(409).json({ success: false, error: 'Ứng viên đã ứng tuyển cho vị trí này rồi' });
        }

        // Insert apply record
        const now = new Date();
        const sql = `INSERT INTO Applies (CandidateID, postID, applicationDate, pickCandidate) VALUES (?, ?, ?, 'pending')`;
        const [result] = await pool.execute(sql, [candidateID, id, now]);

        res.status(201).json({
            success: true,
            message: 'Ứng tuyển thành công',
            data: { applyId: result.insertId, candidateID, postID: id, appliedAt: now }
        });
    } catch (error) {
        console.error('Lỗi tạo apply:', error.message);
        // Handle trigger violations (e.g. from before_insert_applies trigger)
        if (error.message && (error.message.includes('Ứng viên đã ứng tuyển') || error.message.includes('Hạn chót'))) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// 6. Lấy thống kê kỹ năng cho tin tuyển (GET /:id/skill-analysis)
// Gọi stored procedure sp_AnalyzeCandidateSkillMatch
const getSkillAnalysis = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if posting exists
        const [postRows] = await pool.execute('SELECT postID FROM Posting WHERE postID = ?', [id]);
        if (!postRows || postRows.length === 0) {
            return res.status(404).json({ success: false, error: `Posting ID ${id} không tồn tại` });
        }

        // Call stored procedure
        const sql = `CALL sp_AnalyzeCandidateSkillMatch(?)`;
        const [result] = await pool.execute(sql, [id]);

        // Extract the result set (usually result[0] or result[0][0] depending on MySQL version)
        let data = [];
        if (Array.isArray(result) && result.length > 0) {
            if (Array.isArray(result[0])) {
                data = result[0];
            } else {
                data = result;
            }
        }

        // Enrich with CandidateID from User table if not present in procedure result
        if (data.length > 0 && !data[0].CandidateID) {
            const enrichedData = await Promise.all(
                data.map(async (candidate) => {
                    const email = candidate.ContactEmail || candidate.emailAddr;
                    if (email && candidate.CandidateName) {
                        try {
                            // Try 1: Find by exact email (case-insensitive)
                            let [userRows] = await pool.execute(
                                'SELECT userID FROM `User` WHERE LOWER(emailAddr) = LOWER(?) LIMIT 1',
                                [email.trim()]
                            );
                            
                            // Try 2: Find by full name if email doesn't match
                            if (!userRows || userRows.length === 0) {
                                [userRows] = await pool.execute(
                                    'SELECT userID FROM `User` WHERE LOWER(fullName) = LOWER(?) LIMIT 1',
                                    [candidate.CandidateName.trim()]
                                );
                            }
                            
                            // Try 3: Query Candidate + User through Applies
                            if (!userRows || userRows.length === 0) {
                                [userRows] = await pool.execute(
                                    `SELECT DISTINCT c.CandidateID as userID 
                                     FROM Candidate c 
                                     JOIN \`User\` u ON c.CandidateID = u.userID 
                                     WHERE LOWER(u.emailAddr) = LOWER(?) 
                                     LIMIT 1`,
                                    [email.trim()]
                                );
                            }
                            
                            if (userRows && userRows.length > 0) {
                                return {
                                    ...candidate,
                                    CandidateID: userRows[0].userID
                                };
                            }
                        } catch (err) {
                            // Silently continue if enrichment fails
                        }
                    }
                    return candidate;
                })
            );
            
            data = enrichedData;
        }

        res.status(200).json({
            success: true,
            message: 'Phân tích kỹ năng ứng viên',
            postID: id,
            candidates: data
        });
    } catch (error) {
        console.error('Lỗi phân tích kỹ năng:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Lấy danh sách ứng viên (GET /:id/candidates)
// Gọi stored procedure get_candidates_by_post - trả về danh sách ứng viên sạch cho một posting
const getCandidatesByPosting = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if posting exists
        const [postRows] = await pool.execute('SELECT postID FROM Posting WHERE postID = ?', [id]);
        if (!postRows || postRows.length === 0) {
            return res.status(404).json({ success: false, error: `Posting ID ${id} không tồn tại` });
        }

        // Call stored procedure to get candidates for this posting
        const sql = `CALL get_candidates_by_post(?)`;
        const [result] = await pool.execute(sql, [id]);

        // Extract the result set
        let candidates = [];
        if (Array.isArray(result) && result.length > 0) {
            if (Array.isArray(result[0])) {
                candidates = result[0];
            } else {
                candidates = result;
            }
        }

        res.status(200).json({
            success: true,
            message: `Danh sách ứng viên cho vị trí ID ${id}`,
            postID: id,
            totalApplicants: candidates.length,
            candidates
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách ứng viên:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAllPostings,
    getPostingById,
    getAppliesByPosting,
    createPosting,
    updatePosting,
    deletePosting,
    createApply,
    getSkillAnalysis,
    getCandidatesByPosting
};