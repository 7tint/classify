const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');

function checkPrereq(prerequisites, code, callback) {
  console.log("Code: " + code);
  console.log("Prerequisites: " + prerequisites);
  if (prerequisites == code) {
    callback(false);
  }

  if (prerequisites == null) {
    console.log("returning true");
    callback(true);
  }

  else {
    // Check each prerequisite
    for (var i = 0; i < prerequisites.length; i++) {
      var prereq = prerequisites[i];

      if (prereq != code) {
        Course.find({code: prereq}, function(err, searchResults) {
          if (!searchResults.length || searchResults.prereq == null) {
            console.log("returning true");
            callback(true);
          }
          else {
            console.log(searchResults);
            checkPrereq(searchResults[0].prereq, code, function(isValid) {
              callback(isValid);
            });
          }
        });
      }
    }
  }
}

router.get("/:code", async (req, res) => {
  const course = await Course.findOne({ code: req.params.code })
  // if (err) {
  //   console.log(err);
  // } else {
  res.render("course-info", { course: course });
  // }
});

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
    pace: req.body.coursePace,
    prereq: req.body.coursePrerequisites
  };


  // Search for existing courses with the course code to check for duplicates
  Course.find({code: course.code}, function(err, searchResults) {
    // If no results are found, proceed
    if (!searchResults.length) {
      // Check that the course prerequisites is valid
      checkPrereq(course.prereq, course.code, function(isValid) {
        if (isValid) {
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
        else {
          console.log("Course prerequisites makes an infinite loop");
          res.redirect("/admin/courses");
          // Redirect to admin courses with an error message
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
