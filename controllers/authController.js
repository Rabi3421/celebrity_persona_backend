const OTP = require('../models/otpModel');
const User = require('../models/userModel');
const { sendOTP } = require('../services/emailService');
const { generateJWT } = require('../services/jwtService');

exports.requestOTP = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otp = await sendOTP(email);
    res.json({ message: 'OTP sent successfully' }); // Remove OTP in production
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    // Verify OTP
    const otpEntry = await OTP.findOne({ email });
    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Register or login user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    // Generate JWT
    const token = generateJWT(user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};
