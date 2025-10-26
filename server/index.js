// server.js or index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// Environment Variables
// ==========================
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PORT = process.env.PORT || 3000;

// ==========================
// MongoDB Connection
// ==========================
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('💡 Please create a .env file with MONGODB_URI and JWT_SECRET');
  process.exit(1);
}

// Mask password in logs
const maskedURI = MONGODB_URI.replace(/:(.*)@/, ':****@');
console.log('🔗 Connecting to MongoDB:', maskedURI);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Please check:');
    console.log('   - MongoDB Atlas credentials');
    console.log('   - Network access in Atlas');
    console.log('   - Connection string format');
    process.exit(1);
  });

// ==========================
// User Schema & Model
// ==========================
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 120,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  displayName: String,
  photoURL: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update the `updatedAt` timestamp
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

// ==========================
// Routes
// ==========================

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, mobile } = req.body;

    // Validate fields
    if (!name || !email || !password || !age || !gender || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      mobile,
      displayName: name,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare response (without password)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      mobile: user.mobile,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare user data
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      mobile: user.mobile,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});
