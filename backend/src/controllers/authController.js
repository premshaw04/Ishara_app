const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// Generate JWT (Access Token)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic,
        access_token: generateToken(user._id),
        refresh_token: generateRefreshToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic,
        access_token: generateToken(user._id),
        refresh_token: generateRefreshToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Google
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'No Google token provided' });
    }

    // Verify token with Google
    // Note: Since this is often used with multiple client IDs (iOS, Android, Web),
    // you might need to pass an array of client IDs or just rely on verifyIdToken without audience strictness
    // if you have multiple clients, but for safety we specify the web one.
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id', 
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      // Give them a random secure password since they use Google to log in
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
      });
    }

    // Generate our own JWTs for them
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      profilePic: user.profilePic,
      access_token: generateToken(user._id),
      refresh_token: generateRefreshToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

// @desc    Forgot Password - Generate OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    await OTP.deleteMany({ email }); // Delete any existing OTPs for this email
    await OTP.create({ email, otp });

    // Setup Nodemailer transport
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Change to your preferred service if not using Gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Ishara App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset Code - Ishara App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1877F2; margin: 0;">Ishara App</h2>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h3 style="color: #333333; margin-top: 0;">Password Reset Request</h3>
              <p style="color: #555555; line-height: 1.6;">Hello,</p>
              <p style="color: #555555; line-height: 1.6;">We received a request to reset the password for your Ishara account. Please use the following 6-digit verification code to complete the process:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #1877F2; letter-spacing: 5px; padding: 10px 20px; background-color: #f0f7ff; border-radius: 5px; border: 1px solid #cce4ff;">
                  ${otp}
                </span>
              </div>
              
              <p style="color: #555555; line-height: 1.6; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999999; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Ishara App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
    } else {
      // Fallback if email is not configured
      console.log(`\n\n[SIMULATED EMAIL] OTP for password reset for ${email}: ${otp}\n\n`);
    }

    res.json({ message: 'OTP processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a temporary reset token (can be just a JWT valid for 15 mins)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '15m' });

    // OTP verified, can delete it now
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'OTP verified', token: resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and update password
    user.password = password; // pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      access_token: generateToken(user._id),
      refresh_token: generateRefreshToken(user._id), // Optional: rotate refresh token
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshToken,
  googleLogin,
};
