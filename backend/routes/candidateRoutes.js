const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// POST: Create new user
router.post('/user/create', candidateController.createUser);

// POST: Create new candidate (requires existing userID)
router.post('/create', candidateController.createCandidate);

// POST: Apply as new candidate (create user + candidate + apply in one step)
router.post('/apply-new', candidateController.applyAsNewCandidate);

// GET candidate profile (optionally pass ?employerId= to filter CV access)
router.get('/:id', candidateController.getCandidateProfile);

// PUT: Update candidate profile
router.put('/:id', candidateController.updateCandidate);
// PUT: Update full profile including experiences/education/certificates
router.put('/:id/full', candidateController.updateCandidateFullProfile);


module.exports = router;
