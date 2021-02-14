const express = require("express");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const router = express.Router({mergeParams: true});
const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");
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
//
// function updateCourseDepartmentsHelper(course, department, oldDepartment, callback) {
// 	if (department !== "") {
// 		Course.findOneAndUpdate({code: course}, {department}, function(err, updatedCourse) {
// 			if (err) {
// 				console.log("ERROR while updating course object!");
// 				callback(err);
// 				// Redirect to admin courses with an error message
// 			}
// 			else {
// 				if (oldDepartment !== "") {
// 					Department.findOneAndUpdate({_id: oldDepartment}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
// 						if (err) {
// 							console.log("ERROR while adding course to department!");
// 							callback(err);
// 						}
// 					});
// 				}
// 				Department.findOneAndUpdate({_id: department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
// 					if (err) {
// 						console.log("ERROR while adding course to department!");
// 						callback(err);
// 					}
// 					else {
// 						callback();
// 					}
// 				});
// 			}
// 		});
// 	}
// 	else {
// 		Course.findOneAndUpdate({code: course}, {$unset: {department: ""}}, function(err, updatedCourse) {
// 			if (err) {
// 				console.log("ERROR while updating course object!");
// 				callback(err);
// 				// Redirect to admin courses with an error message
// 			}
// 			else {
// 				if (oldDepartment !== "") {
// 					Department.findOneAndUpdate({_id: oldDepartment}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
// 						if (err) {
// 							console.log("ERROR while adding course to department!");
// 							callback(err);
// 						}
// 						else {
// 							callback();
// 						}
// 					});
// 				}
// 				else {
// 					callback();
// 				}
// 			}
// 		});
// 	}
// }

function badStr(str) {
  return str.includes("/");
}

const validateCourse = (req, res, next) => {
  const courseSchema = Joi.object({
    course: Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
      description: Joi.string(),
      grade: Joi.number().required().min(0),
      pace: Joi.string(),
      prereq: Joi.array().items(Joi.string()),
      department: Joi.objectId(),
      teachers: Joi.array().items(Joi.objectId()),
      reviews: Joi.array().items(Joi.objectId())
    }).required()
  });
  const {error} = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

/* ------------ START OF MANAGE COURSES ROUTES ----------------- */
//
// router.get("/manage", function(req, res) {
// 	Department.find({}, (err, departments) => {
// 		if (err) {
// 			console.log(err);
// 			req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//       res.redirect("/courses");
// 		}
// 		else {
// 			Course.find({}, function(err, courses) {
// 				if (err) {
// 					console.log(err);
//           req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//           res.redirect("/courses");
// 				}
// 				else {
// 					res.render("courses/manage", {departments, courses});
// 				}
// 			});
// 		}
// 	});
// });

// router.put("/manage", async function(req, res) {
// 	const courses = req.body.courses;
// 	const departments = req.body.departments;
// 	var oldDepartments = new Array();
// 	var isValid = true;
//
// 	if (!(courses) || courses.length === 0) {
// 		req.flash("error", "Please create courses before assigning them to departments!");
// 		res.redirect("/courses/manage");
// 	}
//
// 	else {
// 		await Promise.all(departments.map(async function(department) {
// 			if (department) {
// 				if (await ObjectId.isValid(department)) {
// 					let foundDepartment = await Department.findOne({_id: department});
// 					if (foundDepartment === null || foundDepartment === undefined || !foundDepartment) {
// 						isValid = false;
// 					}
// 				} else {
// 					isValid = false;
// 				}
// 			}
// 		}));
//
// 		if (!isValid) {
// 			req.flash("error", "The departments submitted are not valid!");
// 			res.redirect("/courses/manage");
// 		}
//
// 		else {
// 			await Promise.all(courses.map(async function(course) {
// 				let foundCourse = await Course.findOne({code: course});
// 				if (foundCourse === null || foundCourse === undefined || !foundCourse) {
// 					isValid = false;
// 				}
// 				else {
// 					if (foundCourse.department === undefined) {
// 						oldDepartments.push("");
// 					} else {
// 						oldDepartments.push(foundCourse.department);
// 					}
// 				}
// 			}));
//
// 			if (!isValid) {
// 				req.flash("error", "The course codes submitted are not valid!");
// 				res.redirect("/courses/manage");
// 			}
//
// 			else {
// 				if (courses.length !== departments.length || courses.length !== oldDepartments.length) {
// 					console.log("(array mismatch) while updating course departments.");
//           req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
// 					res.redirect("/courses/manage");
// 				}
//
// 				else {
// 					await Promise.all(courses.map(async function(course, i) {
// 						await updateCourseDepartmentsHelper(course, departments[i], oldDepartments[i], function(err) {
// 							if (err) {
// 								console.log(err);
//                 req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//                 res.redirect("/courses/manage");
// 							}
// 						});
// 					}));
//           req.flash("success", "Courses updated successfully!");
// 					res.redirect("/courses/manage");
// 				}
// 			}
// 		}
// 	}
// });

/* ------------ START OF COURSE RESTFUL ROUTES ----------------- */

router.get("/", function(req, res) {
  Course.find({}, async function(err, courses) {
    if (err) {
      console.log(err);
      //req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
      //res.redirect("/courses");
      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    }
    else {
      if (courses.length === 0) {
        //res.render("courses/index", {courses});
        res.json({courses: courses});
      }
      else {
        await Promise.all(courses.map(async function(course) {
          if (course.department) {
            if (ObjectId.isValid(course.department)) {
              let foundDepartment = await Department.findOne({_id: course.department});
              if (foundDepartment) {
                course.departmentName = foundDepartment.name;
              }
            }
          }
        }));
        //res.render("courses/index", {courses});
        res.json({courses: courses});
      }
    }
  });
});

// router.get("/new", function(req, res) {
//   Course.find({}, function(err, courses) {
//     if (err) {
//       console.log(err);
//       // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//       // res.redirect("/courses");
//       res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//     }
//     else {
//       Department.find({}, function(err, departments) {
//         if (err) {
//           console.log(err);
//           // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//           // res.redirect("/courses");
//           res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//         } else {
//           //res.render("courses/new", {courses, departments});
//           res.json({courses: courses, departments: departments});
//         }
//       })
//     }
//   });
// });

router.post("/", validateCourse, function(req, res) {
  if (badStr(req.body.code)) {
    // req.flash("error", "Please don't include a '/' in the course code!");
    // res.redirect("/courses/new");
    res.status(400).json({error: "", message: "Please don't include a '/' in the course code!"});
  }
  else {
    var course = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      grade: req.body.grade,
      pace: req.body.pace,
      department: req.body.department,
      prereq: req.body.prereq
    };

    Course.find({code: course.code}, function(err, searchResults) {
      if (err) {
        console.log(err);
        // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
        // res.redirect("/courses/new");
        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
      }
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
                  console.log(err);
                  // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                  // res.redirect("/courses/new");
                  res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                }
                else {
                  if (course.department) {
                    Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: newCourse._id}}, function(err, updatedDepartment) {
                      if (err) {
                        console.log(err);
                        // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                        // res.redirect("/courses/new");
                        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                      }
                    });
                  }
                  // req.flash("success", "Course created successfully!");
                  // res.redirect("/courses");
                  res.status(201).json({course: newCourse});
                }
              });
            });
          }
          else {
            // req.flash("error", "The course prerequisites submitted are not valid!");
            // res.redirect("/courses/new");
            res.status(400).json({error: "", message: "The course prerequisites submitted are not valid!"});
          }
        });
      }
      else {
        // req.flash("error", "The course code submitted already exists!");
        // res.redirect("/courses/new");
        res.status(400).json({error: "", message: "The course code submitted already exists!"});
      }
    });
  }
});

router.get("/:code", function(req, res) {
  Course.findOne({code: req.params.code}, async function(err, course) {
    if (err || course === null || course === undefined || !course) {
      // req.flash("error", "Course not found!");
      // res.redirect("/courses");
      res.status(400).json({error: "", message: "Course not found!"});
    }
    else {
      const reviews = new Array();

      if (course.reviews) {
        await Promise.all(course.reviews.map(async function(review) {
          let foundReview = await Review.findOne({_id: review});
          reviews.push(foundReview);
        }));
      }

      if (course.department) {
        Department.findOne({_id: course.department}, function(err, department) {
          //res.render("courses/show", {course, department, reviews});
          res.json({course: course, department: department, reviews: reviews});
        });
      }
      else {
        //res.render("courses/show", {course, department: undefined, reviews});
        res.json({course: course, department: undefined, reviews: reviews});
      }
    }
  });
});

// router.get("/:code/edit", function(req, res) {
//   Course.findOne({code: req.params.code}, function(err, course) {
//     if (err || course === null || course === undefined || !course) {
//       // req.flash("error", "Course not found!");
//       // res.redirect("/courses");
//       res.status(400).json({error: "", message: "Course not found!"});
//     }
//     else {
//       Course.find({}, function(err, courses) {
//         if (err) {
//           console.log(err);
//           // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//           // res.redirect("/courses");
//           res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//         }
//         else {
//           Department.find({}, function(err, departments) {
//             if (err) {
//               console.log(err);
//               // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//               // res.redirect("/courses");
//               res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//             }
//             else {
//               //res.render("courses/edit", {course, courses, departments});
//               res.json({course: course, courses: courses, departments: departments});
//             }
//           });
//         }
//       });
//     }
//   });
// });

router.put("/:code", validateCourse, function(req, res) {
  if (badStr(req.body.code)) {
    // req.flash("error", "Please don't include a '/' in the course code!");
    // res.redirect("/courses");
    res.status(400).json({error: "", message: "Please don't include a '/' in the course code!"});
  }
  else {
    var course = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      grade: req.body.grade,
      pace: req.body.pace,
      department: req.body.department,
      prereq: req.body.prereq
    };

    let url = "/courses/" + req.params.code + "/edit";

    Course.findOne({code: req.params.code}, function(err, foundCourse) {
      if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
        // req.flash("error", "Course not found!");
        // res.redirect(url);
        res.status(400).json({error: "", message: "Course not found!"});
      }
      else {
        // Search for existing courses with the course code to check for duplicates
        Course.find({code: course.code}, function(err, searchResults) {
          if (err) {
            console.log(err);
            // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
            // res.redirect(url);
            res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
          }
          // If no OTHER COURSE results are found, proceed
          else if (searchResults.length === 0 || searchResults[0].code === req.params.code) {
            // Check that department exists
            Department.findOne({_id: course.department}, function(err, department) {
              if (course.department && (err || department === null || department === undefined || !department)) {
                // req.flash("error", "The department submitted is not valid!");
                // res.redirect(url);
                res.status(400).json({error: "", message: "The department submitted is not valid!"});
              }
              else {
                // Check that the course prerequisites is valid
                checkPrereq(course.prereq, course.code, function(isValid) {
                  if (isValid) {
                    Department.countDocuments({_id: course.department}, function(err, count) {
                      // Remove old course department
                      Course.findOneAndUpdate({code: req.params.code}, {$unset: {department: ""}}, function(err, updatedCourse) {
                        if (err) {
                          console.log(err);
                          // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                          // res.redirect(url);
                          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                        }
                        else {
                          if (count === 0 || count === undefined) {
                            delete course.department;
                          }
                          Course.findOneAndUpdate({code: req.params.code}, course, async function(err, updatedCourse2) {
                            if (err) {
                              console.log(err);
                              // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                              // res.redirect(url);
                              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                            }
                            else {
                              if (updatedCourse.department) {
                                // Remove course from old department
                                await Department.findOneAndUpdate({_id: updatedCourse.department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                  if (err) {
                                    console.log(err);
                                    // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                                    // res.redirect(url);
                                    res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                                  }
                                });
                              }
                              if (course.department) {
                                // Add course to new department
                                await Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                  if (err) {
                                    console.log(err);
                                    // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                                    // res.redirect(url);
                                    res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                                  }
                                });
                              }
                              // req.flash("success", "Course updated successfully!");
                              // res.redirect("/courses");
                              res.status(200).json({course: updatedCourse2});
                            }
                          });
                        }
                      });
                    });
                  }
                  else {
                    // req.flash("error", "The course prerequisites submitted are not valid!");
                    // res.redirect(url);
                    res.status(400).json({error: "", message: "The course prerequisites submitted are not valid!"});
                  }
                });
              }
            });
          }
          // If course code already exists, display error message
          else {
            // req.flash("error", "The course code submitted already exists!");
            // res.redirect(url);
            res.status(400).json({error: "", message: "The course code submitted already exists!"});
          }
        });
      }
    });
  }
});

router.delete("/:code", function(req, res) {
  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      // req.flash("error", "Course not found!");
      // res.redirect("/courses");
      res.status(500).json({error: err, message: "Course not found!"});
    }
    else {
      Course.deleteOne({code: req.params.code}, async function(err, course) {
        if (err) {
          console.log(err);
          // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
          // res.redirect("/courses");
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          if (foundCourse.teachers) {
    				await Promise.all(foundCourse.teachers.map(async function(teacher) {
    					await Teacher.findOneAndUpdate({_id: teacher}, {$pull: {courses: foundCourse._id}}, function(err, updatedTeacher) {
    						if (err) {
    							console.log(err);
                  // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                  // res.redirect("/courses");
                  res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    						}
    					});
    				}));
    			}
          Department.findOneAndUpdate({_id: foundCourse.department}, {$pull: {courses: foundCourse._id}}, async function(err, updatedDepartment) {
            if (err) {
              console.log(err);
              // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
              // res.redirect("/courses");
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              if (foundCourse.reviews) {
    						await Promise.all(foundCourse.reviews.map(async function(review) {
    							await Review.deleteOne({_id: review}, function(err, deletedReview) {
                    if (err) {
      								console.log(err);
      								// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
                      // res.redirect("/courses");
                      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                    }
    							});
    						}));
    					}
              // req.flash("success", "Deleted " + req.params.code + " successfully!");
              // res.redirect("/courses");
              res.status(204).json();
            }
          });
        }
      });
    }
  });
});

/* ------------ START OF COURSE REVIEW ROUTES ----------------- */

// router.get("/:code/reviews/new", function(req, res) {
//   Course.findOne({code: req.params.code}, function(err, course) {
//     if (err) {
//       console.log(err);
//       // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//       // res.redirect("/courses/" + req.params.code);
//       res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//     } else {
//       // res.render("reviews/course/new", {course});
//       res.status(200).json({course: course});
//     }
//   });
// });

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

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.course.hasMetrics === false) {
      review.metric1 = undefined;
      review.metric2 = undefined;
      review.metric3 = undefined;
    }

    if (preferences.course.hasComments === false) {
      review.commentText = undefined;
    }
  });

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      // req.flash("error", "Course not found!");
      // res.redirect("/courses");
      res.status(400).json({error: "", message: "Course not found!"});
    }
    else {
      review.course = foundCourse._id;

      Review.create(review, function(err, newReview) {
        if (err) {
          console.log(err);
          // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
          // res.redirect("/courses/" + req.params.code);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          Course.findOneAndUpdate({code: req.params.code}, {$addToSet: {reviews: newReview._id}}, function(err, updatedCourse) {
            if (err) {
              console.log(err);
              // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
              // res.redirect("/courses/" + req.params.code);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              // req.flash("success", "Thank you for submitting your review!");
              // res.redirect("/courses/" + req.params.code);
              res.status(201).json({review: newReview});
            }
          });
        }
      });
    }
  });
});

// router.get("/:code/:id/edit", function(req, res) {
//   Course.findOne({code: req.params.code}, function(err, foundCourse) {
//     if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
//       // req.flash("error", "Course not found!");
//       // res.redirect("/courses");
//       res.status(400).json({error: "", message: "Course not found!"});
//     }
//     else {
//       Review.findOne({_id: req.params.id}, function(err, review) {
//         if (err) {
//           console.log(err);
//           // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
//           // res.redirect("/courses/" + req.params.code);
//           res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
//         }
//         else {
//           if (review.isCourseReview === true) {
//             // res.render("reviews/course/edit", {review,
//             //   course: foundCourse,
//             //   metric1: review.metric1,
//             //   metric2: review.metric2,
//             //   metric3: review.metric3,
//             //   isAnonymous: review.isAnonymous,
//             // });
//             res.status(200).json({review: review, course: foundCourse});
//           } else {
//             // req.flash("error", "Course review not found!");
//             // res.redirect("/courses/" + req.params.code);
//             res.status(400).json({error: "", message: "Course review not found!"});
//           }
//         }
//       });
//     }
//   });
// });

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

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.course.hasMetrics === false) {
      delete review.metric1;
      delete review.metric2;
      delete review.metric3;
    }

    if (preferences.course.hasComments === false) {
      delete review.commentText;
    }
  });

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      // req.flash("error", "Course not found!");
      // res.redirect("/courses");
      res.status(400).json({error: "", message: "Course not found!"});
    }
    else {
      review.course = foundCourse.id;

      Review.findOneAndUpdate({_id: req.params.id}, review, function(err, foundReview) {
        if (err) {
          console.log(err);
          // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
          // res.redirect("/courses/" + req.params.code);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        } else {
          Course.findOneAndUpdate({code: req.params.code}, {$addToSet: {reviews: foundReview._id}}, function(err, updatedCourse) {
            if (err) {
              console.log(err);
              // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
              // res.redirect("/courses/" + req.params.code);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              // req.flash("success", "Review updated successfully!");
              // res.redirect("/courses/" + req.params.code);
              res.status(200).json({review: foundReview});
            }
          });
        }
      });
    }
  });
});

router.delete("/:code/:id", function(req, res) {
  Review.findOne({_id: req.params.id}, function(err, foundReview) {
    if (err || foundReview === null || foundReview === undefined || !foundReview || foundReview.isCourseReview === false) {
      // req.flash("error", "Review not found!");
      // res.redirect("/courses/" + req.params.code);
      res.status(400).json({error: "", message: "Review not found!"});
    }
    else {
      Review.deleteOne({_id: foundReview._id}, function(err, review) {
        if (err) {
          console.log(err);
          // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
          // res.redirect("/courses/" + req.params.code);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          Course.findOneAndUpdate({_id: foundReview.course}, {$pull: {reviews: foundReview._id}}, function(err, updatedCourse) {
            if (err) {
              console.log(err);
              // req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
              // res.redirect("/courses/" + req.params.code);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              // req.flash("success", "Deleted review successfully!");
              // res.redirect("/courses");
              res.status(204).json();
            }
          });
        }
      });
    }
  });
});

module.exports = router;
