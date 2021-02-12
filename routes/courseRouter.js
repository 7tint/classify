const express = require("express");
const router = express.Router({mergeParams: true});
const Course = require("./../models/courseModel");
const Department = require("./../models/departmentModel");
const Review = require("./../models/reviewModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Preferences = require("./../models/preferencesModel");

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
      req.flash("error", err);
    }
    else {
      if (courses.length === 0) {
        res.render("courses/index", {courses});
      }
      else {
        let promises = courses.map(async function(course) {
          if (course.department) {
            if (ObjectId.isValid(course.department)) {
              let foundDepartment = await Department.findOne({_id: course.department});
              if (foundDepartment) {
                course.departmentName = foundDepartment.name;
              }
            }
          }
        });

        await Promise.all(promises);
        res.render("courses/index", {courses});
      }
    }
  });
});

router.get("/new", function(req, res) {
  Course.find({}, function(err, courses) {
    if (err) {
      console.log(err);
      req.flash("error", err);
    }
    else {
      Department.find({}, function(err, departments) {
        if (err) {
          console.log(err);
          req.flash("error", err);
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
      req.flash("error", err);
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
                req.flash("error", "ERROR while creating course object!");
                // Redirect to admin courses with an error message
              }
              else {
                if (course.department) {
                  Department.findOneAndUpdate({_id: course.department}, {$push: {courses: newCourse._id}}, function(err, updatedDepartment) {
                    if (err) {
                      console.log("ERROR while adding course to department!");
                      console.log(err);
                      req.flash("error", "ERROR while adding course to department!");
                    } else {
                      console.log("Department updated!");
                      req.flash("success", "Department updated!");
                    }
                  });
                }
                console.log("Course created!");
                req.flash("success", "Course created!");
                res.redirect("/courses");
              }
            });
          });
        }
        else {
          console.log("Course prerequisites is not valid!");
          req.flash("error", "Course prerequisites are not valid!");
          res.redirect("/courses/new");
          // Redirect to admin courses with an error message
        }
      });
    }
    // If course code already exists, display error message
    else {
      console.log("Course code already exists!");
      req.flash("error", "Course code already exists!");
      res.redirect("/courses/new");
      // Redirect to admin courses with an error message
    }
  });
});

router.get("/:code", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err || course === null || course === undefined || !course) {
      console.log("Course not found!");
      req.flash("Course not found!", err);
      res.redirect("/courses");
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
    if (err || course === null || course === undefined || !course) {
      console.log("Course not found!");
      req.flash("error", "Course not found!");
      res.redirect("/courses");
    }
    else {
      Course.find({}, function(err, courses) {
        if (err) {
          console.log(err);
          req.flash("error", err);
        }
        else {
          Department.find({}, function(err, departments) {
            if (err) {
              console.log(err);
              req.flash("error", err);
            }
            else {
              res.render("courses/edit", {course, courses, departments});
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
    department: req.body.courseDepartment,
    prereq: req.body.coursePrerequisites
  };

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      console.log("Course not found!");
      req.flash("error", "Course not found!");
      res.redirect("/courses");
    }
    else {
      // Search for existing courses with the course code to check for duplicates
      Course.find({code: course.code}, function(err, searchResults) {
        if (err) {
          console.log(err);
          req.flash("error", err);
        }
        // If no OTHER COURSE results are found, proceed
        else if (searchResults.length === 0 || searchResults[0].code === req.params.code) {
          // Check that department exists
          Department.findOne({_id: course.department}, function(err, department) {
            if (err || department === null || department === undefined || !department) {
              console.log("Department is not valid!");
              req.flash("error", "Department is not valid!");
            }
            else {
              // Check that the course prerequisites is valid
              checkPrereq(course.prereq, course.code, function(isValid) {
                if (isValid) {
                  Department.countDocuments({_id: course.department}, function(err, count) {
                    // Remove old course department
                    Course.findOneAndUpdate({code: req.params.code}, {$unset: {department: ""}}, function(err, updatedCourse) {
                      if (err) {
                        console.log("ERROR while updating course object!");
                        req.flash("error", "ERROR while updating course object!");
                        console.log(err);
                        // Redirect to admin courses with an error message
                      }
                      else {
                        if (count === 0 || count === undefined) {
                          delete course.department;
                        }
                        Course.findOneAndUpdate({code: req.params.code}, course, async function(err, updatedCourse2) {
                          if (err) {
                            console.log("ERROR while updating course object!");
                            req.flash("error", "ERROR while updating course object!");
                            console.log(err);
                            // Redirect to admin courses with an error message
                          }
                          else {
                            if (!(updatedCourse.department === undefined)) {
                              // Remove course from old department
                              await Department.findOneAndUpdate({_id: updatedCourse.department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                if (err) {
                                  console.log("ERROR while adding course to department!");
                                  req.flash("error", "ERROR while adding course to department!");
                                  console.log(err);
                                }
                              });
                            }
                            if (!(course.department === undefined)) {
                              // Add course to new department
                              await Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                if (err) {
                                  console.log("ERROR while adding course to department!");
                                  req.flash("error", "ERROR while adding course to department!");
                                  console.log(err);
                                }
                              });
                            }
                            console.log("Course updated!");
                            req.flash("success", "Course updated!");
                            res.redirect("/courses");
                          }
                        });
                      }
                    });
                  });
                }
                else {
                  console.log("Course prerequisites is not valid!");
                  req.flash("error", "Course prerequisites is not valid!");
                  let url = "/courses/" + req.params.code + "/edit";
                  res.redirect(url);
                  // Redirect to admin courses with an error message
                }
              });
            }
          });
        }
        // If course code already exists, display error message
        else {
          console.log("Course code already exists!");
          req.flash("error", "Course code already exists!");
          let url = "/courses/" + req.params.code + "/edit";
          res.redirect(url);
          // Redirect to admin courses with an error message
        }
      });
    }
  });
});

router.delete("/:code", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      console.log("Course not found!");
      req.flash("error", "Course not found!");
      res.redirect("/courses");
    }
    Course.deleteOne({code: req.params.code}, function(err, course) {
      if (err) {
        console.log(err);
        req.flash("error", err);
      }
      else {
        Department.findOneAndUpdate({_id: foundCourse.department}, {$pull: {courses: foundCourse._id}}, function(err, updatedDepartment) {
          if (err) {
            console.log(err);
            req.flash("error", err);
          } else {
            console.log("Deleted: " + req.params.code);
            req.flash("success", "Deleted: " + req.params.code);
            res.redirect("/courses");
          }
        });
      }
    });
  });
});

/* ------------ START OF COURSE REVIEW ROUTES ----------------- */

router.get("/:code/reviews/new", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err) {
      console.log(err);
      req.flash("error", err);
    } else {
      res.render("reviews/course/new", {course});
    }
  });
});

router.post("/:code/review", async function(req, res) {
  var review = {
    email: "email@domain.com",
    isCourseReview: true,
    metric1: req.body.metric1,
    metric2: req.body.metric2,
    metric3: req.body.metric3,
    commentText: req.body.commentText,
    isAnonymous: req.body.isAnonymous,
  };

  await Preferences.findOne({}, function(err, preferences) {
    if (preferences.course.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }
  });

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      console.log("Course not found!");
      req.flash("error", "Course not found!");
      res.redirect("/courses");
    } else {
      review.course = foundCourse.id;

      Review.create(review, function(err) {
        if (err) {
          console.log("ERROR while creating review object!");
          req.flash("error", "ERROR while creating review object!");
          console.log(err);
        }
        else {
          console.log("Review created!");
          req.flash("success", "Review created!");
          res.redirect("/courses");
        }
      });
    }
  });
});

router.get("/:code/:id/edit", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, course) {
    if (err || course === null || course === undefined || !course) {
      console.log("Review Not Found!");
      req.flash("error", "Review not found!");
      res.redirect("/courses/");
    }
    else {
      Review.findOne({_id: req.params.id}, function(err, review) {
        if (err) {
          console.log(err);
          req.flash("error", err);
        }
        else {
          if (review.isCourseReview === true) {
            res.render("reviews/course/edit", {review, course,
              metric1: review.metric1,
              metric2: review.metric2,
              metric3: review.metric3,
              isAnonymous: review.isAnonymous,
            });
          } else {
            console.log("Not a valid course review!");
            req.flash("error", "Not a valid course review!");
            res.redirect("/courses");
          }
        }
      });
    }
  });
});

router.put("/:code/:id/edit", async function(req, res) {
  var review = {
    email: "email@domain.com",
    isCourseReview: true,
    metric1: req.body.metric1,
    metric2: req.body.metric2,
    metric3: req.body.metric3,
    commentText: req.body.commentText,
    isAnonymous: req.body.isAnonymous,
  };

  await Preferences.findOne({}, function(err, preferences) {
    if (preferences.course.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }
  });

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      console.log("Course not found!");
      req.flash("error", "Course not found!");
      res.redirect("/courses");
    }
    else {
      review.course = foundCourse.id;

      Review.findOneAndUpdate({_id: req.params.id}, review, function(err, foundReview) {
        if (err) {
          console.log(err);
          req.flash("error", err);
        } else {
          console.log("Review updated successfully");
          req.flash("success", "Review updated successfully!");
          res.redirect("/courses");
        }
      });
    }
  });
});

module.exports = router;
