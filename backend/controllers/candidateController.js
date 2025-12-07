const pool = require('../config/db');

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

module.exports = {
  getCandidateProfile
};
