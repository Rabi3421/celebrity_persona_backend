const router = require('express').Router();
const { generateSitemap } = require('../controllers/sitemapController');

router.get('/', generateSitemap);

module.exports = router;