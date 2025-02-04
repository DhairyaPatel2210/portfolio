const mongoose = require("mongoose");

const originSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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

// Ensure origin is unique per user
originSchema.index({ origin: 1, user: 1 }, { unique: true });

const Origin = mongoose.model("Origin", originSchema);

module.exports = Origin;
