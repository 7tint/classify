const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');

async function asyncCheckPrereqHelper(prereq, code, isValid, callback) {
  if (prereq != code) {
    Course.find({code: prereq}, function(err, searchResults) {
      console.log(searchResults);
      console.log(searchResults[0].prereq);
      if (!searchResults.length) {
        callback(false);
      }
      else if (searchResults[0].prereq.length === 0) {
        callback(true);
      }
      else {
        checkPrereq(searchResults[0].prereq, code, function(isValidi) {
          isValid = isValid && isValidi;
          callback(isValid);
        });
      }
    });
  }
}

function checkPrereq(prerequisites, code, callback) {
  if (prerequisites == code) {
    callback(false);
  }

  if (prerequisites == null) {
    callback(true);
  }

  else {
    var isValid = true;

    // Check each prerequisite

    var i = 0;
    prerequisites.forEach(function(prereq, index, prerequisites) {
        asyncCheckPrereqHelper(prereq, code, isValid, function(data) {
             i++;
             isValid = isValid && data;
             if (i === prerequisites.length) {
               callback(isValid);
             }
        });
    });
  }
}

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

router.get("/new", function(req, res) {
  Course.find({}, function(err, allCourses) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("admin-courses", {courses: allCourses});
    }
  });
});

router.get("/:code", async (req, res) => {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("course-info", { course: course });
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
          console.log("Course prerequisites is not valid.");
          res.redirect("/admin/courses");
          // Redirect to admin courses with an error message
        }
      });
    }
    // If course code already exists, display error message
    else {
      console.log("Course code already exists!");
      res.redirect("/courses/new");
      // Redirect to admin courses with an error message
    }
  });
});

module.exports = router;
