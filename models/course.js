const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name: String,
    code: {
      type: String,
      uppercase: true,
      required: true
    },
    description: String,
    grade: Number,
  });

module.exports = mongoose.model('Course', courseSchema)