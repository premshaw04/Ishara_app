const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      default: 'translation',
    },
    details: {
      sign: { type: String, required: true },
      confidence: { type: Number, required: false },
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      expires: 0 
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('History', historySchema);
