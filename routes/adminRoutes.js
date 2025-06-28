const router = require('express').Router();
const { adminLogin, createAdmin } = require('../controllers/adminController');

router.post('/login', adminLogin);
router.post('/create', createAdmin); // Call once and remove after

module.exports = router;