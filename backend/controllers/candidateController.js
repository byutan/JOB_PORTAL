const pool = require('../config/db');

// Helper: normalize date-like inputs to MySQL DATE 'YYYY-MM-DD' or null
function formatDateForSQL(input) {
  if (!input) return null;
  try {
    // For string inputs, try extracting YYYY-MM-DD directly first
    if (typeof input === 'string') {
      // Match ISO format or YYYY-MM-DD format
      const m = input.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1]; // Return the date part only
    }
    // Parse as Date object and convert
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch (e) {
    return null;
  }
}

// GET /api/candidates/:id?employerId=123
// Returns candidate profile (basic info + CVs, experiences, education, skills, certificates)
const getCandidateProfile = async (req, res) => {
  const { id } = req.params;
  const employerId = req.query.employerId; // optional, used to filter CV access

  try {
    const [candRows] = await pool.execute(
      'SELECT c.*, u.fullName AS fullName, u.emailAddr AS userEmail FROM Candidate c LEFT JOIN `User` u ON c.CandidateID = u.userID WHERE c.CandidateID = ?',
      [id]
    );

    if (!candRows || candRows.length === 0) {
      return res.status(404).json({ message: `Candidate ${id} not found` });
    }

    const candidate = candRows[0];

    // CVs: if employerId provided, only return CVs that are public OR have permission for that employer
    let cvSql, cvParams;
    if (employerId) {
      cvSql = `SELECT cv.* FROM CV cv LEFT JOIN CVAccessPermission p ON cv.cvID = p.cvID AND p.EmployerID = ? WHERE cv.CandidateID = ? AND (cv.isPublic = 1 OR p.cvID IS NOT NULL)`;
      cvParams = [employerId, id];
    } else {
      cvSql = 'SELECT * FROM CV WHERE CandidateID = ?';
      cvParams = [id];
    }

    const [cvRows] = await pool.execute(cvSql, cvParams);

    const [expRows] = await pool.execute('SELECT * FROM Experience WHERE CandidateID = ? ORDER BY endDate DESC', [id]);
    const [eduRows] = await pool.execute('SELECT * FROM Education WHERE CandidateID = ? ORDER BY endDate DESC', [id]);
    const [certRows] = await pool.execute('SELECT * FROM Certificate WHERE CandidateID = ?', [id]);
    const [skillRows] = await pool.execute(
      'SELECT s.* FROM Has h JOIN Skill s ON h.SkillID = s.SkillID WHERE h.CandidateID = ?',
      [id]
    );

    res.status(200).json({
      candidate,
      cvs: cvRows,
      experiences: expRows,
      education: eduRows,
      certificates: certRows,
      skills: skillRows
    });
  } catch (error) {
    console.error('Lỗi lấy profile candidate:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Create a new User
const createUser = async (req, res) => {
  const { fullName, emailAddr, phoneNumber, password, sex, birthDate, address } = req.body;

  try {
    // Validate inputs
    if (!fullName || !emailAddr || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'Tên, email và số điện thoại là bắt buộc' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute('SELECT userID FROM `User` WHERE emailAddr = ?', [emailAddr]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ success: false, error: 'Email này đã tồn tại' });
    }

    // Password validation
    const hasDigit = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (!password || password.length < 8 || !hasDigit || !hasUpper || !hasSpecial) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ số, 1 chữ hoa, 1 ký tự đặc biệt' 
      });
    }

    // Insert user
    const sql = `INSERT INTO \`User\` (fullName, emailAddr, phoneNumber, password, sex, birthDate, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [fullName, emailAddr, phoneNumber, password, sex || 'Nam', birthDate, address]);

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      userID: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo user:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new Candidate
const createCandidate = async (req, res) => {
  const { userID, currentTitle, selfIntro, totalYearOfExp } = req.body;

  try {
    // Validate userID
    if (!userID) {
      return res.status(400).json({ success: false, error: 'userID là bắt buộc' });
    }

    // Check if user exists
    const [userRows] = await pool.execute('SELECT userID FROM `User` WHERE userID = ?', [userID]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, error: 'User không tồn tại' });
    }

    // Check if candidate already exists for this user
    const [existingCandidates] = await pool.execute('SELECT CandidateID FROM Candidate WHERE CandidateID = ?', [userID]);
    if (existingCandidates && existingCandidates.length > 0) {
      return res.status(409).json({ success: false, error: 'Ứng viên này đã tồn tại' });
    }

    // Insert candidate (CandidateID = userID)
    const sql = `INSERT INTO Candidate (CandidateID, currentTitle, selfIntro, totalYearOfExp) 
                 VALUES (?, ?, ?, ?)`;
    await pool.execute(sql, [userID, currentTitle || '', selfIntro || '', totalYearOfExp || 0]);

    res.status(201).json({
      success: true,
      message: 'Tạo hồ sơ ứng viên thành công',
      candidateID: userID
    });
  } catch (error) {
    console.error('Lỗi tạo candidate:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply directly: create user + candidate + apply in one step
const applyAsNewCandidate = async (req, res) => {
  const { 
    fullName, emailAddr, phoneNumber, password, sex, birthDate, address, 
    currentTitle, selfIntro, totalYearOfExp, postID,
    experiences = [], skills = [], cvs = [], foreignLanguages = [], 
    certificates = [], education = []
  } = req.body;

  try {
    // Validate required fields
    if (!fullName || !emailAddr || !phoneNumber || !password || !postID) {
      return res.status(400).json({ success: false, error: 'Thông tin bắt buộc không đủ' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute('SELECT userID FROM `User` WHERE emailAddr = ?', [emailAddr]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ success: false, error: 'Email này đã tồn tại' });
    }

    // Check if posting exists and not expired
    const [postRows] = await pool.execute('SELECT postID, endDate FROM Posting WHERE postID = ?', [postID]);
    if (!postRows || postRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vị trí tuyển dụng không tồn tại' });
    }

    const postingEndDate = new Date(postRows[0].endDate);
    postingEndDate.setHours(23, 59, 59, 999);
    if (new Date() > postingEndDate) {
      return res.status(403).json({ success: false, error: 'Hạn chót ứng tuyển đã hết' });
    }

    // Password validation
    const hasDigit = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (password.length < 8 || !hasDigit || !hasUpper || !hasSpecial) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ số, 1 chữ hoa, 1 ký tự đặc biệt' 
      });
    }

    // 1. Create User
    const userSql = `INSERT INTO \`User\` (fullName, emailAddr, phoneNumber, password, sex, birthDate, address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [userResult] = await pool.execute(userSql, [fullName, emailAddr, phoneNumber, password, sex || 'Nam', birthDate, address]);
    const newUserID = userResult.insertId;

    // 2. Create Candidate - Calculate totalYearOfExp from experiences array
    let calculatedTotalYearOfExp = 0;
    if (Array.isArray(experiences) && experiences.length > 0) {
      for (const exp of experiences) {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate);
          const end = new Date(exp.endDate);
          const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
          calculatedTotalYearOfExp += years;
        }
      }
    }
    // Use calculated value, or fallback to provided value, or default to 0
    const finalTotalYearOfExp = calculatedTotalYearOfExp > 0 ? Math.round(calculatedTotalYearOfExp * 10) / 10 : (totalYearOfExp || 0);
    
    const candidateSql = `INSERT INTO Candidate (CandidateID, currentTitle, selfIntro, totalYearOfExp) 
                         VALUES (?, ?, ?, ?)`;
    await pool.execute(candidateSql, [newUserID, currentTitle || '', selfIntro || '', finalTotalYearOfExp]);

    // 3. Create Apply
    const now = new Date();
    const applySql = `INSERT INTO Applies (CandidateID, postID, applicationDate, pickCandidate) 
                      VALUES (?, ?, ?, 'pending')`;
    const [applyResult] = await pool.execute(applySql, [newUserID, postID, now]);

    // 4. Insert Experience Records
    if (Array.isArray(experiences) && experiences.length > 0) {
      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        if (exp.jobTitle && exp.companyName) {
          const expSql = `INSERT INTO Experience (CandidateID, expID, jobTitle, CompanyName, startDate, endDate, expDesc, Candidate_ID) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const start = formatDateForSQL(exp.startDate);
          const end = formatDateForSQL(exp.endDate);
          await pool.execute(expSql, [newUserID, i + 1, exp.jobTitle, exp.companyName, start, end, exp.description || '', newUserID]);
        }
      }
    }

    // 5. Insert Education Records
    if (Array.isArray(education) && education.length > 0) {
      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        if (edu.schoolName) {
          const eduSql = `INSERT INTO Education (CandidateID, eduID, schoolName, major, degree, startDate, endDate, Candidate_ID) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const s = formatDateForSQL(edu.startDate);
          const e = formatDateForSQL(edu.endDate);
          await pool.execute(eduSql, [newUserID, i + 1, edu.schoolName, edu.major || '', edu.degree || '', s, e, newUserID]);
        }
      }
    }

    // 6. Insert Foreign Language Records
    if (Array.isArray(foreignLanguages) && foreignLanguages.length > 0) {
      for (let i = 0; i < foreignLanguages.length; i++) {
        const lang = foreignLanguages[i];
        if (lang.language) {
          const langSql = `INSERT INTO ForeignLanguage (CandidateID, langID, language, level, Candidate_ID) 
                          VALUES (?, ?, ?, ?, ?)`;
          await pool.execute(langSql, [newUserID, i + 1, lang.language, lang.level || 'Sơ cấp', newUserID]);
        }
      }
    }

    // 7. Insert Certificate Records
    if (Array.isArray(certificates) && certificates.length > 0) {
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (cert.certName) {
          const certSql = `INSERT INTO Certificate (CandidateID, certID, certName, organization, issueDate, certURL, Candidate_ID) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
          const issue = formatDateForSQL(cert.issueDate);
          await pool.execute(certSql, [newUserID, i + 1, cert.certName, cert.organization || '', issue, cert.certURL || '', newUserID]);
        }
      }
    }

    // 8. Insert CV Records
    if (Array.isArray(cvs) && cvs.length > 0) {
      for (let i = 0; i < cvs.length; i++) {
        const cv = cvs[i];
        if (cv.cvName) {
          const cvSql = `INSERT INTO CV (CandidateID, cvID, cvName, cvURL, Candidate_ID) 
                        VALUES (?, ?, ?, ?, ?)`;
          await pool.execute(cvSql, [newUserID, i + 1, cv.cvName, cv.cvURL || '', newUserID]);
        }
      }
    }

    // 9. Insert Skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skill of skills) {
        // Handle both skill objects and raw IDs
        const skillId = typeof skill === 'object' ? skill.SkillID : skill;
        if (skillId) {
          await pool.execute('INSERT INTO Has (CandidateID, skillID) VALUES (?, ?)', [newUserID, skillId]).catch(() => {
            // Ignore duplicate errors
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công! Tài khoản của bạn đã được tạo.',
      data: {
        userID: newUserID,
        candidateID: newUserID,
        applyID: applyResult.insertId,
        email: emailAddr
      }
    });
  } catch (error) {
    console.error('Lỗi apply:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
const updateCandidate = async (req, res) => {
  const { id } = req.params;
  const { currentTitle, selfIntro, totalYearOfExp } = req.body;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM Candidate WHERE CandidateID = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Ứng viên không tồn tại" });
    }

    await pool.execute(
      `UPDATE Candidate 
       SET currentTitle = ?, selfIntro = ?, totalYearOfExp = ?
       WHERE CandidateID = ?`,
      [currentTitle, selfIntro, totalYearOfExp, id]
    );

    res.json({
      success: true,
      message: "Cập nhật hồ sơ ứng viên thành công"
    });

  } catch (error) {
    console.error("Update candidate error:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getCandidateProfile,
  createUser,
  createCandidate,
  applyAsNewCandidate,
  updateCandidate,
  updateCandidateFullProfile: async (req, res) => {
    const { id } = req.params;
    const {
      fullName, emailAddr, phoneNumber, address,
      currentTitle, selfIntro, totalYearOfExp,
      experiences = [], education = [], certificates = []
    } = req.body;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verify candidate exists
      const [candRows] = await conn.execute('SELECT * FROM Candidate WHERE CandidateID = ?', [id]);
      if (!candRows || candRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ message: 'Ứng viên không tồn tại' });
      }

      // Update User info (CandidateID maps to userID)
      await conn.execute(
        'UPDATE `User` SET fullName = ?, emailAddr = ?, phoneNumber = ?, address = ? WHERE userID = ?',
        [fullName || null, emailAddr || null, phoneNumber || null, address || null, id]
      );

      // Update Candidate basic fields
      await conn.execute(
        `UPDATE Candidate SET currentTitle = ?, selfIntro = ?, totalYearOfExp = ? WHERE CandidateID = ?`,
        [currentTitle || '', selfIntro || '', totalYearOfExp || 0, id]
      );

      // Replace Experiences
      await conn.execute('DELETE FROM Experience WHERE CandidateID = ?', [id]);
      if (Array.isArray(experiences) && experiences.length > 0) {
        for (let i = 0; i < experiences.length; i++) {
          const exp = experiences[i];
          const expSql = `INSERT INTO Experience (CandidateID, expID, jobTitle, CompanyName, startDate, endDate, expDesc, Candidate_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const s = formatDateForSQL(exp.startDate);
          const e = formatDateForSQL(exp.endDate);
          await conn.execute(expSql, [id, i + 1, exp.jobTitle || '', exp.CompanyName || '', s, e, exp.expDesc || '', id]);
        }
      }

      // Replace Education
      await conn.execute('DELETE FROM Education WHERE CandidateID = ?', [id]);
      if (Array.isArray(education) && education.length > 0) {
        for (let i = 0; i < education.length; i++) {
          const edu = education[i];
          const eduSql = `INSERT INTO Education (CandidateID, eduID, schoolName, major, degree, startDate, endDate, Candidate_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const s = formatDateForSQL(edu.startDate);
          const e = formatDateForSQL(edu.endDate);
          await conn.execute(eduSql, [id, i + 1, edu.schoolName || '', edu.major || '', edu.degree || '', s, e, id]);
        }
      }

      // Replace Certificates
      await conn.execute('DELETE FROM Certificate WHERE CandidateID = ?', [id]);
      if (Array.isArray(certificates) && certificates.length > 0) {
        for (let i = 0; i < certificates.length; i++) {
          const cert = certificates[i];
          const certSql = `INSERT INTO Certificate (CandidateID, certID, certName, organization, issueDate, certURL, Candidate_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
          const issue = formatDateForSQL(cert.issueDate);
          await conn.execute(certSql, [id, i + 1, cert.certName || '', cert.organization || '', issue, cert.certURL || '', id]);
        }
      }

      await conn.commit();

      // Return updated profile fragments
      const [cvRows] = await conn.execute('SELECT * FROM CV WHERE CandidateID = ?', [id]);
      const [expRows] = await conn.execute('SELECT * FROM Experience WHERE CandidateID = ? ORDER BY endDate DESC', [id]);
      const [eduRows] = await conn.execute('SELECT * FROM Education WHERE CandidateID = ? ORDER BY endDate DESC', [id]);
      const [certRows] = await conn.execute('SELECT * FROM Certificate WHERE CandidateID = ?', [id]);

      conn.release();

      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ đầy đủ thành công',
        experiences: expRows,
        education: eduRows,
        certificates: certRows,
        cvs: cvRows
      });
    } catch (error) {
      await conn.rollback();
      conn.release();
      console.error('Lỗi cập nhật full profile:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
