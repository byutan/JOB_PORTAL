const express = require('express');
const router = express.Router();
const postingController = require('../controllers/postingController');



router.get('/', postingController.getAllPostings);
router.get('/:id/applies', postingController.getAppliesByPosting);
router.get('/:id/skill-analysis', postingController.getSkillAnalysis);
router.get('/:id/candidates', postingController.getCandidatesByPosting);
router.get('/:id', postingController.getPostingById);

router.post('/', postingController.createPosting);
router.post('/:id/apply', postingController.createApply);

router.put('/:id', postingController.updatePosting);

router.delete('/:id', postingController.deletePosting);

module.exports = router;