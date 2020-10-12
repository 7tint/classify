const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');

router.get("/", function(req, res) {
  Course.find({}, function(err, allCourses) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("courses", {courses: allCourses});
    }
  });
});

router.post("/", function(req, res) {
  var course = {
    name: req.body.courseName,
    code: req.body.courseCode,
    description: req.body.courseDescription,
    grade: req.body.courseGrade,
    pace: req.body.coursePace
  };

  // Search for existing courses with the course code to check for duplicates
  Course.find({code: course.code}, function(err, searchResults) {
    // If no results are found, create the course
    if (!searchResults.length) {
      Course.create(course, function(err, updatedCourse) {
        if (err) {
          console.log("ERROR while creating course object!");
          console.log(err);
          // Redirect to admin courses with an error message
        }
        else {
          console.log("Course created!");
          res.redirect("/admin/courses");
        }
      });
    }
    // If course code already exists, display error message
    else {
      console.log("Course code already exists!");
      res.redirect("/admin/courses");
      // Redirect to admin courses with an error message
    }
  });
});

// router.get('/create-new-course', (req, res) => {
//   Course.create({
//     name: "Course 5",
//     code: "mpm5u",
//     description: "Hello",
//     grade: 9,
//   }, function(err, course) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(course);
//       }
//   });
//   res.redicrect("/admin");
// })


module.exports = router;
