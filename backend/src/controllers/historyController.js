const History = require('../models/History');

// @desc    Get history logs for user
// @route   GET /api/v1/history
// @access  Private
const getHistoryLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = { user: req.user._id };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let historyQuery = History.find(query).sort({ createdAt: -1 });

    if (limit) {
      historyQuery = historyQuery.limit(Number(limit));
    }

    const history = await historyQuery.exec();

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new history log
// @route   POST /api/v1/history
// @access  Private
const addHistoryLog = async (req, res) => {
  try {
    const { action, sign, confidence } = req.body;

    if (!sign) {
      return res.status(400).json({ message: 'Sign data is required' });
    }

    const historyLog = await History.create({
      user: req.user._id,
      action: action || 'translation',
      details: {
        sign,
        confidence,
      },
    });

    res.status(201).json(historyLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a specific history log
// @route   DELETE /api/v1/history/:id
// @access  Private
const deleteHistoryLog = async (req, res) => {
  try {
    const historyLog = await History.findById(req.params.id);

    if (!historyLog) {
      return res.status(404).json({ message: 'History log not found' });
    }

    // Check if the log belongs to the user
    if (historyLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await historyLog.deleteOne();

    res.json({ message: 'History log removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all history logs for user
// @route   DELETE /api/v1/history/all
// @access  Private
const clearAllHistory = async (req, res) => {
  try {
    // Only delete items that are NOT favorites
    await History.deleteMany({ user: req.user._id, isFavorite: { $ne: true } });
    res.json({ message: 'All un-saved history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite status of a history log
// @route   PATCH /api/v1/history/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const historyLog = await History.findById(req.params.id);

    if (!historyLog) {
      return res.status(404).json({ message: 'History log not found' });
    }

    if (historyLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    historyLog.isFavorite = !historyLog.isFavorite;

    if (historyLog.isFavorite) {
      // Remove expiration so it never deletes
      historyLog.expiresAt = undefined;
    } else {
      // Reset expiration to 7 days from now
      historyLog.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    await historyLog.save();
    res.json(historyLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHistoryLogs,
  addHistoryLog,
  deleteHistoryLog,
  clearAllHistory,
  toggleFavorite,
};
