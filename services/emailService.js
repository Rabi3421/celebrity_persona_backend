const nodemailer = require('nodemailer');
const OTP = require('../models/otpModel');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await OTP.findOneAndUpdate({ email }, { otp, expiresAt }, { upsert: true });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Login',
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return otp;
};
