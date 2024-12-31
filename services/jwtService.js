const jwt = require('jsonwebtoken');

exports.generateJWT = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
