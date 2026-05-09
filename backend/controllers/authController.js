const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('groups', 'name');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      message: 'Password updated successfully',
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error updating password',
    });
  }
};

module.exports = { register, login, getMe };
