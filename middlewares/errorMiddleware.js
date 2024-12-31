// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);  // Log the error to the console
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,  // Optionally send the error message
    });
  };
  
  module.exports = { errorHandler };
  