const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

dotenv.config();
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Custom rate limiter for API key logic
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: (req, res) => {
//     // Unlimited for special API key, limit for others
//     const apiKey = req.headers['api_key'];
//     if (apiKey === 'c2134352b0ae669cff7496c79db4db96') {
//       return Number.MAX_SAFE_INTEGER; // Effectively unlimited
//     }
//     return 100; // Limit for others
//   },
//   message: 'Too many requests from this IP or API key, please try again later.',
//   keyGenerator: (req, res) => {
//     // Use API key as the rate limit key if present, else fallback to IP
//     return req.headers['api_key'] || req.ip;
//   }
// });
// app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

app.use(morgan('combined'));
app.use('/uploads', express.static('uploads'));

const db = require('./config/db');
db();

const allowedOrigins = ['https://celebritypersona.com', 'http://localhost:8080'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Routes
app.use('/api/celebrities', require('./routes/celebrityRoutes'));
app.use('/api/outfits', require('./routes/outfitRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/track', require('./routes/trackRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/trending', require('./routes/trendingRoutes'));
app.use('/api/inquiry', require('./routes/inquiryRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/sitemap.xml', require('./routes/sitemapRoutes'));
app.use('/api', require('./routes/healthRoutes')); // Add this line
app.use('/api/api-keys', require('./routes/apiKeyRoutes'));
// Error handler middleware
app.use(require('./middleware/errorHandler'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));