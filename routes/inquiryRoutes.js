const router = require('express').Router();
const { submitInquiry } = require('../controllers/inquiryController');

router.post('/', submitInquiry);

module.exports = router;