const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for temporary local storage before uploading to Cloudinary
const upload = multer({ dest: 'uploads/' });
const {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  uploadProfilePicture,
  updateCalibration,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProfile).put(protect, updateProfile);
router.route('/settings').get(protect, getSettings).put(protect, updateSettings);
router.route('/picture').post(protect, upload.single('image'), uploadProfilePicture);
router.route('/calibration').post(protect, updateCalibration);

module.exports = router;
