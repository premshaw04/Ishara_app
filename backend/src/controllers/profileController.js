const User = require('../models/User');
const fs = require('fs');
const crypto = require('crypto');

// @desc    Get user profile
// @route   GET /api/v1/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
        settings: user.settings,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;
      // Note: Email cannot be updated as per requirements

      // Update password if provided in profile update (optional depending on frontend, usually done separately)
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        phoneNumber: updatedUser.phoneNumber,
        settings: updatedUser.settings,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user settings
// @route   GET /api/v1/profile/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(user.settings);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/v1/profile/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.settings = {
        ...user.settings.toObject(),
        ...req.body
      };

      const updatedUser = await user.save();

      res.json(updatedUser.settings);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/v1/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  const log = `[${new Date().toISOString()}] Upload hit. File: ${!!req.file}, Body: ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync('debug.log', log);
  console.log('Upload hit, req.file:', req.file, 'req.body:', req.body);
  try {
    if (!req.file) {
      fs.appendFileSync('debug.log', 'Error: No image provided\n');
      console.log('No image provided in req.file');
      return res.status(400).json({ message: 'No image provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Manual Signed Upload to Cloudinary using fetch to bypass SDK/WAF bugs
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create SHA-1 signature without folder to avoid folder creation permission errors
    const strToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    // Create raw form data using native Node FormData
    const form = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer], { type: req.file.mimetype });
    form.append('file', blob, req.file.originalname);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);

    // Dynamic import of node-fetch (native to ES Modules, or use native fetch if Node 22)
    // Since Node 22 supports global fetch, we'll use that directly!
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
      // Do NOT set Content-Type header explicitly when using native FormData with fetch
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Cloudinary API Error: ${result.error?.message || JSON.stringify(result)}`);
    }

    console.log('Upload successful to Cloudinary:', result.secure_url);

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    // Save URL to user
    user.profilePic = result.secure_url;
    await user.save();

    res.json({ profilePic: user.profilePic });
  } catch (error) {
    fs.appendFileSync('debug.log', `Error: ${error.message}\n${error.stack}\n`);
    console.error('Upload Error Details:', error);
    // Attempt to delete local file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
};

// @desc    Update calibration profile and sync with ML backend
// @route   POST /api/v1/profile/calibration
// @access  Private
const updateCalibration = async (req, res) => {
  try {
    const { flexMin, flexMax, imuOffsets } = req.body;
    
    if (!flexMin || !flexMax || flexMin.length !== 5 || flexMax.length !== 5) {
      return res.status(400).json({ message: 'Invalid calibration data. Expected flexMin and flexMax arrays of length 5.' });
    }

    // 1. Sync with FastAPI ML Server
    try {
      const mlPayload = {
        flex_min: flexMin,
        flex_max: flexMax
      };
      if (imuOffsets && imuOffsets.length === 6) {
        mlPayload.imu_offsets = imuOffsets;
      }

      const mlResponse = await fetch('http://127.0.0.1:8000/calibrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlPayload)
      });
      
      if (!mlResponse.ok) {
        console.warn('Warning: FastAPI ML server rejected calibration update:', await mlResponse.text());
      }
    } catch (err) {
      console.warn('Warning: Could not reach FastAPI ML server to sync calibration:', err.message);
    }

    // 2. Save to User Settings in Database
    const user = await User.findById(req.user._id);
    if (user) {
      user.settings = {
        ...user.settings?.toObject(),
        calibration: {
          flexMin,
          flexMax,
          imuOffsets: imuOffsets || [0,0,0,0,0,0],
          lastCalibrated: new Date().toISOString()
        }
      };
      await user.save();
    }

    res.json({ message: 'Calibration updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  uploadProfilePicture,
  updateCalibration,
};
