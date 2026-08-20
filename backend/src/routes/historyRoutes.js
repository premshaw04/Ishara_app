const express = require('express');
const router = express.Router();
const {
  getHistoryLogs,
  addHistoryLog,
  deleteHistoryLog,
  clearAllHistory,
  toggleFavorite,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHistoryLogs)
  .post(protect, addHistoryLog);
router.route('/all').delete(protect, clearAllHistory);
router.route('/:id').delete(protect, deleteHistoryLog);
router.route('/:id/favorite').patch(protect, toggleFavorite);

module.exports = router;
