const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all skills
router.get('/', async (req, res) => {
  try {
    const [skills] = await pool.execute('SELECT SkillID, skillName, skillCategory FROM Skill ORDER BY skillCategory, skillName');
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
