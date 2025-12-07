const express = require('express');
const router = express.Router();
const postingController = require('../controllers/postingController');



router.get('/', postingController.getAllPostings);
router.get('/:id/applies', postingController.getAppliesByPosting);
router.get('/:id', postingController.getPostingById);

router.post('/', postingController.createPosting);

router.put('/:id', postingController.updatePosting);

router.delete('/:id', postingController.deletePosting);

module.exports = router;