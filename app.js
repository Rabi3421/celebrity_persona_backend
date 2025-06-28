const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/celebrities', require('./routes/celebrity.routes'));
app.use('/api/v1/outfits', require('./routes/outfit.routes'));
app.use('/api/v1/blogs', require('./routes/blog.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));
app.use('/api/v1/contact', require('./routes/contact.routes'));
app.use('/api/v1/collaboration', require('./routes/collaboration.routes'));
app.use('/api/v1/admin-extra', require('./routes/admin.extra.routes'));

module.exports = app;
