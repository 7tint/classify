const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    uppercase: true,
    required: true
  },
  description: String,
  grade: {
    type: Number,
    required: true
  },
  pace: String,
  prereq: [String],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
    }
  ],
  reviews: [
    {
       type: mongoose.Schema.Types.ObjectId,
       ref: "CourseReview"
    }
  ]
});

module.exports = mongoose.model('Course', courseSchema);
