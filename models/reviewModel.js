const mongoose = require('mongoose');
const Preferences = require("./../models/preferencesModel.js");

const reviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  isCourseReview: {
    type: Boolean,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { 
      return this.isCourseReview === false;
    }
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { 
      return this.isCourseReview === true;
    }
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
    required: true,
    default: Date.now
  },
  isAnonymous: {
    type: Boolean,
    required: true
  },
  isApproved: {
    type: Boolean,
    required: true,
  }
});

module.exports = mongoose.model("Review", reviewSchema);
