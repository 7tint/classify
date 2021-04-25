const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");
const Department = require("./../models/departmentModel");
const Preferences = require("./../models/preferencesModel");
const Review = require("./../models/reviewModel");
const ObjectId = require("mongoose").Types.ObjectId;

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
    let isValid = true;
    let i = 0;
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

function badStr(str) {
  return (/[^a-zA-Z0-9-._~]/.test(word));
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.coursesGet = function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Course.find({$or: [{code: regex}, {name: regex}, {description: regex}, {pace: regex}]}).populate("department", "name").exec(function(err, courses) {
      if (err) {
        console.log(err);
        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
      } else {
        res.json({courses: courses});
      }
    });
  } else {
    Course.find({}).populate("department", "name").exec(function(err, courses) {
      if (err) {
        console.log(err);
        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
      } else {
        res.json({courses: courses});
      }
    });
  }
}

exports.coursePost = function(req, res) {
  if (badStr(req.body.course.code)) {
    res.status(400).json({error: "", message: "Please don't include special characters in the course code!"});
  }
  else {
    let course = req.body.course;

    Course.find({code: course.code}, function(err, searchResults) {
      if (err) {
        console.log(err);
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
                  res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                }
                else {
                  if (course.department) {
                    Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: newCourse._id}}, function(err, updatedDepartment) {
                      if (err) {
                        console.log(err);
                        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                      }
                    });
                  }
                  res.status(201).json({course: newCourse});
                }
              });
            });
          }
          else {
            res.status(400).json({error: "", message: "The course prerequisites submitted are not valid!"});
          }
        });
      }
      else {
        res.status(400).json({error: "", message: "The course code submitted already exists!"});
      }
    });
  }
}

exports.courseGet = function(req, res) {
  Course.findOne({code: req.params.code}).populate("reviews").populate("teachers").populate("department", "name").exec(function(err, course) {
    if (err || course === null || course === undefined || !course) {
      res.status(400).json({error: "", message: "Course not found!"});
    }
    else {
      res.json({course: course});
    }
  });
}

exports.coursePut = function(req, res) {
  if (badStr(req.body.course.code)) {
    res.status(400).json({error: "", message: "Please don't include special characters in the course code!"});
  }
  else {
    const course = req.body.course;
    let url = "/courses/" + req.params.code + "/edit";

    Course.findOne({code: req.params.code}, function(err, foundCourse) {
      if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
        res.status(400).json({error: "", message: "Course not found!"});
      }
      else {
        // Search for existing courses with the course code to check for duplicates
        Course.find({code: course.code}, function(err, searchResults) {
          if (err) {
            console.log(err);
            res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
          }
          // If no OTHER COURSE results are found, proceed
          else if (searchResults.length === 0 || searchResults[0].code === req.params.code) {
            // Check that department exists
            Department.findOne({_id: course.department}, function(err, department) {
              if (course.department && (err || department === null || department === undefined || !department)) {
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
                          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                        }
                        else {
                          if (count === 0 || count === undefined) {
                            delete course.department;
                          }
                          Course.findOneAndUpdate({code: req.params.code}, course, async function(err, updatedCourse2) {
                            if (err) {
                              console.log(err);
                              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                            }
                            else {
                              if (updatedCourse.department) {
                                // Remove course from old department
                                await Department.findOneAndUpdate({_id: updatedCourse.department}, {$pull: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                                  }
                                });
                              }
                              if (course.department) {
                                // Add course to new department
                                await Department.findOneAndUpdate({_id: course.department}, {$addToSet: {courses: updatedCourse._id}}, function(err, updatedDepartment) {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                                  }
                                });
                              }
                              res.status(200).json({course: updatedCourse2});
                            }
                          });
                        }
                      });
                    });
                  }
                  else {
                    res.status(400).json({error: "", message: "The course prerequisites submitted are not valid!"});
                  }
                });
              }
            });
          }
          // If course code already exists, display error message
          else {
            res.status(400).json({error: "", message: "The course code submitted already exists!"});
          }
        });
      }
    });
  }
}

exports.courseDelete = function(req, res) {
  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      res.status(500).json({error: err, message: "Course not found!"});
    }
    else {
      Course.deleteOne({code: req.params.code}, async function(err, course) {
        if (err) {
          console.log(err);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          if (foundCourse.teachers) {
    				await Promise.all(foundCourse.teachers.map(async function(teacher) {
    					await Teacher.findOneAndUpdate({_id: teacher}, {$pull: {courses: foundCourse._id}}, function(err, updatedTeacher) {
    						if (err) {
    							console.log(err);
                  res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    						}
    					});
    				}));
    			}
          Department.findOneAndUpdate({_id: foundCourse.department}, {$pull: {courses: foundCourse._id}}, async function(err, updatedDepartment) {
            if (err) {
              console.log(err);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              if (foundCourse.reviews) {
    						await Promise.all(foundCourse.reviews.map(async function(review) {
    							await Review.deleteOne({_id: review}, function(err, deletedReview) {
                    if (err) {
      								console.log(err);
                      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
                    }
    							});
    						}));
    					}
              res.status(204).json();
            }
          });
        }
      });
    }
  });
}
