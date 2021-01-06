const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");
const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");

// function getCourseNames(departments, callback) {
// 	let getCourseNamesPromise = new Promise(function(resolve, reject) {
// 		departments.forEach(function(department, i) {
//
// 			let getCourseNamesPromise2 = new Promise(function(resolve, reject) {
// 				department.courses.forEach(async function(course, j) {
// 					await Course.findOne({_id: course}, function(err, course) {
// 						if (err) {
// 							console.log(err);
// 						}
// 						else {
// 							departments[i].courses[j] = {
// 								_id: course._id,
// 								code: course.code,
// 								name: course.name
// 							}
// 						}
// 					});
// 					if (j + 1 === department.courses.length) {
// 						resolve();
// 					}
// 				});
// 			});
//
// 			getCourseNamesPromise2.then(function() {
// 				if (i + 1 === departments.length) {
// 					resolve();
// 				}
// 			});
// 		});
// 	});
//
// 	getCourseNamesPromise.then(function() {
// 		console.log(departments);
// 		callback(departments);
// 	});
// }

// get add course to department
router.get("/assign-courses", function(req, res) {
	Department.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		}
		else {
			Course.find({}, function(err, courses) {
				if (err) {
					console.log(err);
				}
				else {
					// getCourseNames(departments, function(returnedDepartments) {
					// 	res.render("relations/department-course", {departments: returnedDepartments, courses});
					// });

					res.render("relations/department-course", {departments, courses});
				}
			});
		}
	});
});

// get add teacher to course
router.get("/assign-teachers", function(req, res) {
	Course.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		}
		else {
			Teacher.find({}, function(err, courses) {
				if (err) {
					console.log(err);
				}
				else {
					res.render("relations/course-teacher", { departments, courses });
				}
			});
		}
	});
});

// put add course to department
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
                      await Department.findOneAndUpdate({_id: searchResults[0].department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                        if (err) {
                          console.log("ERROR while adding course to department!");
                          console.log(err);
                        }
                      });
                    }
                    if (!(course.department === undefined)) {
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

// put add teacher to course //same copypasta as above get req
router.put("/teacher/:code", function(req, res) {
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
                      await Department.findOneAndUpdate({_id: searchResults[0].department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                        if (err) {
                          console.log("ERROR while adding course to department!");
                          console.log(err);
                        }
                      });
                    }
                    if (!(course.department === undefined)) {
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

module.exports = router;
