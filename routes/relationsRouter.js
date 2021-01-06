const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");
const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");

function updateCourseDepartmentsHelper2(course, department, oldDepartment, i, callback) {

	if (department !== "") {
		Course.findOneAndUpdate({code: course}, {department}, function(err, updatedCourse) {
			if (err) {
				console.log("ERROR while updating course object!");
				console.log(err);
				// Redirect to admin courses with an error message
			}
			else {
				if (oldDepartment !== "") {
					Department.findOneAndUpdate({_id: oldDepartment}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
						if (err) {
							console.log("ERROR while adding course to department!");
							console.log(err);
						}
					});
				}
				Department.findOneAndUpdate({_id: department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
					if (err) {
						console.log("ERROR while adding course to department!");
						console.log(err);
					}
					else {
						callback();
					}
				});
			}
		});
	}
	else {
		Course.findOneAndUpdate({code: course}, {$unset: {department: ""}}, function(err, updatedCourse) {
			if (err) {
				console.log("ERROR while updating course object!");
				console.log(err);
				// Redirect to admin courses with an error message
			}
			else {
				if (oldDepartment !== "") {
					Department.findOneAndUpdate({_id: oldDepartment}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
						if (err) {
							console.log("ERROR while adding course to department!");
							console.log(err);
						}
						else {
							callback();
						}
					});
				}
				else {
					callback();
				}
			}
		});
	}
}

function updateCourseDepartmentsHelper(courses, departments, oldDepartments, i, callback) {
	updateCourseDepartmentsHelper2(courses[i], departments[i], oldDepartments[i], i, function() {
		if (i + 1 === courses.length) {
			callback();
		} else {
			i++;
			updateCourseDepartmentsHelper(courses, departments, oldDepartments, i, callback);
		}
	});
}

function getOldDepartmentsHelper(course, oldDepartments, callback) {
	Course.findOne({code: course}, function(err, course) {
		if (err || course === null || course === undefined || !course) {
			console.log(err);
			callback(false, undefined);
		}
		else {
			if (course.department === undefined) {
				oldDepartments.push("");
				callback(true, oldDepartments);
			} else {
				oldDepartments.push(course.department);
				callback(true, oldDepartments);
			}
		}
	});
}

function getOldDepartments(courses, oldDepartments, i, callback) {
	getOldDepartmentsHelper(courses[i], oldDepartments, function(isValid, oldDepartments) {
		if (!isValid) {
			callback(false, undefined);
		}
		else if (i + 1 === courses.length) {
			callback(true, oldDepartments);
		}
		else {
			i++;
			getOldDepartments(courses, oldDepartments, i, callback);
		}
	});
}


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
router.put("/assign-courses", function(req, res) {
	const courses = req.body.courses;
	const departments = req.body.departments;
	var oldDepartments = new Array();

	getOldDepartments(courses, oldDepartments, 0, function(isValid, oldDepartments) {
		if (!isValid) {
			console.log("ERROR in course codes submitted!");
		}

		else if (courses.length === 0) {
			console.log("ERROR please create courses before assigning them to departments!");
		}

		else if (courses.length !== departments.length || courses.length !== oldDepartments.length) {
			console.log("ERROR (array mismatch) while updating course departments!");
		}

		else {
			updateCourseDepartmentsHelper(courses, departments, oldDepartments, 0, function() {
				console.log("Successfully updated course departments!");
				res.redirect("/admin");
			});
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
