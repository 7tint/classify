const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');
const Department = require("./../models/departmentModel");

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

// async function asyncCheckTeachersHelper(teacher, isValid, callback) {
//   Teacher.find({_id: teacher}, function(err, searchResults) {
//     if (err) {
//       callback(false);
//     }
//     else if (!searchResults.length) {
//       callback(false);
//     }
//     else {
//       callback(true);
//     }
//   });
// }
//
// function checkTeachers(teachers, callback) {
//   if (teachers == [] || teachers == null) {
//     callback(true);
//   }
//
//   else {
//     var isValid = true;
//
//     var i = 0;
//     teachers.forEach(function(teacher, index) {
//       asyncCheckTeachersHelper(teacher, isValid, function(data) {
//         i++;
//         isValid = isValid && data;
//         if (i === teachers.length) {
//           callback(isValid);
//         }
//       });
//     });
//   }
// }



router.get("/", function(req, res) {
  Course.find({}, async function(err, courses) {
    if (err) {
      console.log(err);
    }
    else {
      let getCourses = new Promise(function(resolve, reject) {
        courses.forEach(async function(course, i) {
          if (!(course.department === undefined)) {
            await Department.findOne({_id: course.department}, function(err, department) {
              course.departmentName = department.name;
            });
          }
          if (i + 1 === courses.length) {
            resolve();
          }
        });
      });

      getCourses.then(function() {
        res.render("courses/index", {courses});
      });
    }
  });
});

router.get("/new", function(req, res) {
  Course.find({}, function(err, courses) {
    if (err) {
      console.log(err);
    }
    else {
      Department.find({}, function(err, departments) {
        if (err) {
          console.log(err);
        } else {
          res.render("courses/new", {courses, departments});
        }
      })
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
    department: req.body.courseDepartment,
    prereq: req.body.coursePrerequisites,
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
          Department.countDocuments({_id: course.department}, function(err, count) {
            if (count === 0 || count === undefined) {
              delete course.department;
            }
            Course.create(course, function(err, newCourse) {
              if (err) {
                console.log("ERROR while creating course object!");
                console.log(err);
                // Redirect to admin courses with an error message
              }
              else {
                if (course.department) {
                  Department.findOneAndUpdate({_id: course.department}, {$push: {courses: newCourse._id}}, function(err, updatedDepartment) {
                    if (err) {
                      console.log("ERROR while adding course to department!");
                      console.log(err);
                    } else {
                      console.log("Department updated!");
                    }
                  });
                }
                console.log("Course created!");
                res.redirect("/courses");
              }
            });
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
      if (!(course.department === undefined)) {
        Department.findOne({_id: course.department}, function(err, department) {
          res.render("courses/show", {course, department});
        });
      }
      else {
        res.render("courses/show", {course, department: undefined});
      }
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
          Department.find({}, function(err, departments) {
            if (err) {
              console.log(err);
            } else {
              res.render("courses/edit", {course, courses, departments});
            }
          })
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
    department: req.body.courseDepartment,
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
          Department.countDocuments({_id: course.department}, function(err, count) {
            // Remove old course department
            Course.findOneAndUpdate({code: req.params.code}, {$unset: {department: ""}}, function(err, updatedCourse) {
              if (err) {
                console.log("ERROR while updating course object!");
                console.log(err);
                // Redirect to admin courses with an error message
              }
              else {
                if (count === 0 || count === undefined) {
                  delete course.department;
                }
                Course.findOneAndUpdate({code: req.params.code}, course, async function(err, updatedCourse) {
                  if (err) {
                    console.log("ERROR while updating course object!");
                    console.log(err);
                    // Redirect to admin courses with an error message
                  }
                  else {
                    if (!(searchResults[0].department === undefined)) {
                      // Remove course from old department
                      await Department.findOneAndUpdate({_id: searchResults[0].department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                        if (err) {
                          console.log("ERROR while adding course to department!");
                          console.log(err);
                        }
                      });
                    }
                    if (!(course.department === undefined)) {
                      // Add course to new department
                      await Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                        if (err) {
                          console.log("ERROR while adding course to department!");
                          console.log(err);
                        }
                      });
                    }
                    console.log("Course updated!");
                    res.redirect("/courses");
                  }
                });
              }
            });
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
