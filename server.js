const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Correct way to load environment variables
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

connectDB(); // Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());

// Base route to check if the API is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Routes
app.use('/api/auth', authRoutes);

// Global error handler
const { errorHandler } = require('./middlewares/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
