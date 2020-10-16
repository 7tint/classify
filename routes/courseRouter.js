const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');
const Teacher = require('./../models/teacherModel');

async function asyncCheckPrereqHelper(prereq, code, isValid, callback) {
  if (prereq != code) {
    Course.find({code: prereq}, function(err, searchResults) {
      if (err) {
        callback(false);
      }
      else if (!searchResults.length) {
        callback(false);
      }
      else if (searchResults[0].prereq === null || searchResults[0].prereq.length === 0) {
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

  else {
    callback(false);
  }
}

function checkPrereq(prerequisites, code, callback) {
  if (prerequisites == [] || prerequisites == null) {
    callback(true);
  }

  else {
    var isValid = true;

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

async function asyncCheckTeachersHelper(teacher, isValid, callback) {
  Teacher.find({_id: teacher}, function(err, searchResults) {
    if (err) {
      callback(false);
    }
    else if (!searchResults.length) {
      callback(false);
    }
    else {
      callback(true);
    }
  });
}

function checkTeachers(teachers, callback) {
  if (teachers == [] || teachers == null) {
    callback(true);
  }

  else {
    var isValid = true;

    var i = 0;
    teachers.forEach(function(teacher, index) {
      asyncCheckTeachersHelper(teacher, isValid, function(data) {
        i++;
        isValid = isValid && data;
        if (i === teachers.length) {
          callback(isValid);
        }
      });
    });
  }
}



router.get("/", function(req, res) {
  Course.find({}, function(err, courses) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("courses/index", {courses});
    }
  });
});

router.get("/new", function(req, res) {
  Course.find({}, function(err, courses) {
    if (err) {
      console.log(err);
    }
    else {
      Teacher.find({}, function(err, teachers) {
        if (err) {
          console.log(err);
        }
        else {
          res.render("courses/new", {courses, teachers});
        }
      });
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
    prereq: req.body.coursePrerequisites,
    teachers: req.body.courseTeachers
  };

  // Search for existing courses with the course code to check for duplicates
  Course.find({code: course.code}, function(err, searchResults) {
    if (err) {
      console.log(err);
    }
    // If no results are found, proceed
    else if (!searchResults.length) {
      // Check that the course prerequisites is valid
      checkPrereq(course.prereq, course.code, function(isValid) {
        if (isValid) {
          checkTeachers(course.teachers, function(isValid) {
            if (isValid) {
              Course.create(course, function(err, newCourse) {
                if (err) {
                  console.log("ERROR while creating course object!");
                  console.log(err);
                  // Redirect to admin courses with an error message
                }
                else {
                  console.log("Course created!");
                  res.redirect("/courses");
                }
              });
            }
            else {
              console.log("Teachers are not valid.");
              res.redirect("/courses/new");
            }
          });
        }
        else {
          console.log("Course prerequisites is not valid.");
          res.redirect("/courses/new");
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

router.get("/:code", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("courses/show", { course });
    }
  });
});

router.get("/:code/edit", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err) {
      console.log(err);
    }
    else {
      Course.find({}, function(err, courses) {
        if (err) {
          console.log(err);
        }
        else {
          Teacher.find({}, function(err, teachers) {
            if (err) {
              console.log(err);
            }
            else {
              res.render("courses/edit", { course, courses, teachers });
            }
          });
        }
      });
    }
  });
});

router.put("/:code", function(req, res) {
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
    if (err) {
      console.log(err);
    }
    // If no OTHER COURSE results are found, proceed
    else if (!searchResults.length || searchResults[0].code === req.params.code) {
      // Check that the course prerequisites is valid
      checkPrereq(course.prereq, course.code, function(isValid) {
        if (isValid) {
          checkTeachers(course.teachers, function(isValid) {
            if (isValid) {
              Course.findOneAndUpdate({code: req.params.code}, course, function(err, updatedCourse) {
                if (err) {
                  console.log("ERROR while creating course object!");
                  console.log(err);
                  // Redirect to admin courses with an error message
                }
                else {
                  console.log("Course updated!");
                  res.redirect("/courses");
                }
              });
            }
            else {
              console.log("Teachers are not valid.");
              res.redirect("/courses/new");
            }
          });
        }
        else {
          console.log("Course prerequisites is not valid.");
          let url = "/courses/" + course.code + "/edit";
          res.redirect(url);
          // Redirect to admin courses with an error message
        }
      });
    }
    // If course code already exists, display error message
    else {
      console.log("Course code already exists!");
      let url = "/courses/" + course.code + "/edit";
      res.redirect(url);
      // Redirect to admin courses with an error message
    }
  });
});

router.delete("/:code", function(req, res) {
  Course.deleteOne({code: req.params.code}, function(err, deletedCourse) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("Deleted: " + req.params.code);
      res.redirect("/courses");
    }
  });
});

module.exports = router;
