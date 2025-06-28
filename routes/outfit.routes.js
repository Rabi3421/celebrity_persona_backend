const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/outfit.controller');

router.post('/', auth, ctrl.createOutfit);
router.get('/', ctrl.getAllOutfits);
router.get('/:slug', ctrl.getOutfitBySlug);
router.put('/:slug', auth, ctrl.updateOutfit);
router.delete('/:slug', auth, ctrl.deleteOutfit);

module.exports = router;
