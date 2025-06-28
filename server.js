const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

const db = require('./config/db');
db();

// Routes
app.use('/api/celebrities', require('./routes/celebrityRoutes'));
app.use('/api/outfits', require('./routes/outfitRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/track', require('./routes/trackRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/trending', require('./routes/trendingRoutes'));
app.use('/api/inquiry', require('./routes/inquiryRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/sitemap.xml', require('./routes/sitemapRoutes'));