const router = require('express').Router();
const { trackEvent } = require('../controllers/trackController');

router.post('/', trackEvent);

module.exports = router;