const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  metric1: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i',
    required: true
  },
  metric2: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i',
    required: true
  },
  metric3: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i',
    required: true
  },
  commentText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAnonymous: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model("CourseReview", courseReviewSchema);
