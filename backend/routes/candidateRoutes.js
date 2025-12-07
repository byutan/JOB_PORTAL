const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// GET candidate profile (optionally pass ?employerId= to filter CV access)
router.get('/:id', candidateController.getCandidateProfile);

module.exports = router;
