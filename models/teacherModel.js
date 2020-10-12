const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    prefferedTitle: {
        type: String,
        required: true
    }, 
    profilePicture: {
        type: String
    },
    courses: {
        type: [String]
    },
    reviews: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "TeacherReview"
        }
      ]
});

module.exports = mongoose.model('Teacher', teacherSchema)