const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hash });
    await newUser.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ message: 'Server error while creating admin' });
  }
};