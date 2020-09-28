const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: String,
    description: String,
    courses: [String],
    teachers: [String]
});

module.exports = mongoose.model('Department', departmentSchema);