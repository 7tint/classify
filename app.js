var express = require("express");
var app = express();

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/course_catalogue", {useNewUrlParser: true, useUnifiedTopology: true});

const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

// Schema for a course
var courseSchema = new mongoose.Schema({
  name: String,
  code: {
    type: String,
    uppercase: true,
    required: true
  },
  description: String,
  grade: Number,
});

const Course = mongoose.model("Course", courseSchema);



Course.create({
  name: "Course 5",
  code: "mpm5u",
  description: "Hello",
  grade: 9,
}, function(err, course) {
  if (err) {
    console.log(err);
  } else {
    console.log(course);
  }
});

// Retrieve courses and log them
// Course.find({}, function(err, courses) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(courses);
//   }
// });



app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
