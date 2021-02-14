const express = require("express");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const router = express.Router({ mergeParams: true });
const Teacher = require("./../models/teacherModel");
const Review = require("./../models/reviewModel");
const Course = require("./../models/courseModel");
const Preferences = require("./../models/preferencesModel");

function convertNametoObj(name) {
	var firstName = "";
	var lastName = "";
	var isFirstName = true;

	for (let i = 0; i < name.length; i++) {
		if (name[i] === "_") {
			isFirstName = false;
			i++;
		}
		if (isFirstName) {
			firstName += name[i];
		}
		else {
			lastName += name[i];
		}
	}

	var name = {
		firstName: firstName,
		lastName: lastName
	};

	return name;
}

function badStr(str) {
  return str.includes("/");
}

function validateTeacher(req, res, next) {
  const teacherSchema = Joi.object({
    teacher: Joi.object({
      name: Joi.object({
				firstName: Joi.string().required(),
				lastName: Joi.string().required()
			}).required(),
      preferredTitle: Joi.string().required(),
      profilePicture: Joi.string().allow(null, ""),
      courses: Joi.array().items(Joi.objectId())
    }).required()
  });
  const {error} = teacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
		console.log(msg);
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

function validatePostReview(req, res, next) {
  const reviewSchema = Joi.object({
    review: Joi.object({
      course: Joi.objectId(),
      metric1: Joi.number(),
      metric2: Joi.number(),
      metric3: Joi.number(),
      commentText: Joi.string().allow(null, ""),
      isAnonymous: Joi.boolean().required(),
    }).required()
  });
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

router.get("/", function(req, res) {
	Teacher.find({}, function(err, allTeachers) {
		if (err) {
			console.log(err);
			// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
			// res.redirect("/");
			res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
		}
		else {
			// res.render("teachers/index", {teachers: allTeachers});
			res.json({teachers: allTeachers})
		}
	});
});

// router.get("/new", function(req, res) {
// 	Course.find({}, function(err, courses) {
// 		if (err) {
// 			console.log(err);
// 			req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
// 			res.redirect("/teaachers");
// 		} else {
// 			res.render("teachers/new", {courses});
// 		}
// 	});
// });

router.post("/", validateTeacher, function(req, res) {
	if (badStr(req.body.teacher.name.firstName) || badStr(req.body.teacher.name.lastName)) {
		// req.flash("error", "Please don't include a '/' in the teacher name!");
    // res.redirect("/teachers/new");
		res.status(400).json({error: "", message: "Please don't include a '/' in the teacher name!"});
	} else {
		const teacher = req.body.teacher;
		let isValid = true;
		let courseids = new Array();

		Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
			if (err) {
				console.log(err);
				// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
				// res.redirect("/teachers/new");
				res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			}
			else if (!searchResults.length) {
				if (teacher.courses) {
					await Promise.all(teacher.courses.map(async function(course) {
						let foundCourse = await Course.findOne({code: course});
						if (foundCourse === null || foundCourse === undefined || !foundCourse) {
							isValid = false;
						} else {
							courseids.push(foundCourse._id);
						}
					}));
				}

				if (isValid) {
					teacher.courses = courseids;

					Teacher.create(teacher, async function(err, newTeacher) {
						if (err) {
							console.log(err);
							// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
							// res.redirect("/teachers/new");
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
						else {
							await Promise.all(teacher.courses.map(async function(course) {
								await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: newTeacher._id}}, function(err, updatedCourse) {
									if (err) {
										console.log(err);
										// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
										// res.redirect("/teachers/new");
										res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
									}
								});
							}));
							// req.flash("success", "Teacher created successfully!");
							// res.redirect("/teachers");
							res.status(201).json({teacher: newTeacher});
						}
					});
				} else {
					// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
					// res.redirect("/teachers/new");
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
			}
			else {
				console.log("Teacher already exists!");
				// req.flash("error", "Teacher already exists!");
				// res.redirect("/teachers/new");
				res.status(400).json({error: "", message: "Teacher already exists!"});
			}
		});
	}
});

router.get("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, async function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			// req.flash("error", "Teacher not found!");
			// res.redirect("/teachers");
			res.status(400).json({error: "", message: "Teacher not found!"});
		}
		else {
			const reviews = new Array();

      if (teacher.reviews) {
        await Promise.all(teacher.reviews.map(async function(review) {
          let foundReview = await Review.findOne({_id: review});
          reviews.push(foundReview);
        }));
      }
			// res.render("teachers/show", {teacher, reviews});
			res.json({teacher: teacher, reviews: reviews});
		}
	});
});

// router.get("/:name/edit", function(req, res) {
// 	const nameObject = convertNametoObj(req.params.name);
// 	Teacher.findOne({name: nameObject}, function(err, teacher) {
// 		if (err || teacher === null || teacher === undefined || !teacher) {
// 			console.log("Teacher not found!");
// 			req.flash("error", "Teacher not found!");
// 		}
// 		else {
// 			Course.find({}, function(err, courses) {
// 				res.render("teachers/edit", { teacher, courses });
// 			});
// 		}
// 	});
// });

router.put("/:name", validateTeacher, function(req, res) {
	console.log(req.body);
	if (badStr(req.body.teacher.name.firstName) || badStr(req.body.teacher.name.lastName)) {
		// req.flash("error", "Please don't include a '/' in the teacher name!");
    // res.redirect("/teachers/" + req.params.name + "/edit");
		res.status(400).json({error: "", message: "Please don't include a '/' in the teacher name!"});
	} else {
		const nameObject = convertNametoObj(req.params.name);
		const teacher = req.body.teacher;
		let isValid = true;
		let courseids = new Array();

		Teacher.findOne({name: nameObject}, function(err, foundTeacher) {
			if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
				// req.flash("error", "Teacher not found!");
				// res.redirect("/teachers");
				res.status(400).json({error: "", message: "Teacher not found!"});
			}
			else {
				Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
					if (err) {
						console.log(err);
						// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
						// res.redirect("/teachers/" + req.params.name + "/edit");
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else if (!searchResults.length) {
						if (teacher.courses) {
							await Promise.all(teacher.courses.map(async function(course) {
								let foundCourse = await Course.findOne({code: course});
								if (foundCourse === null || foundCourse === undefined || !foundCourse) {
									isValid = false;
								} else {
									courseids.push(foundCourse._id);
								}
							}));
						}

						if (isValid) {
							teacher.courses = courseids;
							Teacher.findOneAndUpdate({name: nameObject}, teacher, async function(err, updatedTeacher) {
								if (err) {
									console.log(err);
									// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
									// res.redirect("/teachers/" + req.params.name + "/edit");
									res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
								}
								else {
									if (foundTeacher.courses) {
										await Promise.all(foundTeacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
													// res.redirect("/teachers/" + req.params.name + "/edit");
													res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
												}
											});
										}));
									}
									if (teacher.courses) {
										await Promise.all(teacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
													// res.redirect("/teachers/" + req.params.name + "/edit");
													res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
												}
											});
										}));
									}
									// req.flash("success", "Teacher updated successfully!");
									// res.redirect("/teachers");
									res.status(200).json({teacher: updatedTeacher});
								}
							});
						} else {
							// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
							// res.redirect("/teachers/" + req.params.name + "/edit");
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
					}
					else {
						// req.flash("error", "The teacher name submitted already exists!");
						// res.redirect("/teachers/" + req.params.name + "/edit");
						res.status(400).json({error: "", message: "Teacher name already exists!"});
					}
				});
			}
		});
	}
});

router.delete("/:name", function(req, res) {
	var nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, async function(err, foundTeacher) {
		if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
			// req.flash("error", "Teacher not found!");
			// res.redirect("/teachers");
			res.status(400).json({error: "", message: "Teacher not found!"});
		}
		else {
			if (foundTeacher.courses) {
				await Promise.all(foundTeacher.courses.map(async function(course) {
					await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: foundTeacher._id}}, function(err, updatedCourse) {
						if (err) {
							console.log(err);
							// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
							// res.redirect("/teachers");
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
					});
				}));
			}
			Teacher.deleteOne({name: nameObject}, async function(err, deletedTeacher) {
				if (err) {
					console.log(err);
					// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
					// res.redirect("/teachers");
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					if (foundTeacher.reviews) {
						await Promise.all(foundTeacher.reviews.map(async function(review) {
							await Review.deleteOne({_id: review}, function(err, deletedReview) {
								console.log(err);
								// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
								// res.redirect("/teachers");
								res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
							});
						}));
					}
					// req.flash("success", "Deleted " + nameObject.firstName + " " + nameObject.lastName + " successfully!");
					// res.redirect("/teachers");
					res.status(204).json();
				}
			});
		}
	});
});

/* ------------ START OF TEACHER REVIEW ROUTES ----------------- */

// router.get("/:name/reviews/new", function(req, res) {
// 	const nameObject = convertNametoObj(req.params.name);
// 	Teacher.findOne({name: nameObject}, function(err, teacher) {
// 		if (err) {
// 			console.log(err);
// 			// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
// 			// res.redirect("/teachers/" + req.params.code);
// 			res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
// 		} else {
// 			//res.render("reviews/teacher/new", {teacher});
// 			res.status(200).json({teacher: teacher});
// 		}
// 	});
// });


router.post("/:name/review", validateReview, async function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	const review = req.body.review;
	review.isCourseReview = false;
	review.email = "example@domain.com";

	await Preferences.findOne({}, function(err, preferences) {
		if (preferences.teacher.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.teacher.hasMetrics === false) {
      review.metric1 = undefined;
      review.metric2 = undefined;
      review.metric3 = undefined;
    }

    if (preferences.teacher.hasComments === false) {
      review.commentText = undefined;
    }
	});

	Teacher.findOne({name: nameObject}, function(err, foundTeacher) {
		if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
			// req.flash("error", "Teacher Not Found!");
			// res.redirect("/teachers");
			res.status(400).json({error: "", message: "Teacher not found!"});
		}
		else {
			review.teacher = foundTeacher._id;

			Review.create(review, function(err, newReview) {
				if (err) {
					console.log(err);
					// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
					// res.redirect("/teachers/" + req.params.code);
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					Teacher.findOneAndUpdate({_id: review.teacher}, {$addToSet: {reviews: newReview._id}}, function(err, updatedTeacher) {
            if (err) {
							console.log(err);
							// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
							// res.redirect("/teachers/" + req.params.code);
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
							// req.flash("success", "Thank you for submitting your review!");
              // res.redirect("/teachers/" + req.params.code);
							res.status(201).json({review: newReview});
            }
          });
				}
			});
		}
	});
});


// router.get("/:name/:id/edit", function(req, res) {
// 	const nameObject = convertNametoObj(req.params.name);
// 	Teacher.findOne({name: nameObject}, function(err, teacher) {
// 		if (err || teacher === null || teacher === undefined || !teacher) {
// 			req.flash("error", "Teacher Not Found!");
// 			res.redirect("/teachers");
// 		}
// 		else {
// 			Review.findOne({_id: req.params.id}, function(err, review) {
// 				if (err) {
// 					console.log(err);
// 					req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
// 					res.redirect("/teachers/" + req.params.code);
// 				}
// 				else {
// 					if (review.isCourseReview === false) {
// 						res.render("reviews/teacher/edit", {review, teacher,
// 							metric1: review.metric1,
// 							metric2: review.metric2,
// 							metric3: review.metric3,
// 							isAnonymous: review.isAnonymous,
// 						});
// 					} else {
// 						req.flash("error", "Teacher review not found!");
// 						res.redirect("/teachers");
// 					}
// 				}
// 			});
// 		}
// 	});
// });

router.put("/:name/:id/edit", validateReview, async function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	const review = req.body.review;

	await Preferences.findOne({}, function(err, preferences) {
		if (preferences.teacher.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.teacher.hasMetrics === false) {
      review.metric1 = undefined;
      review.metric2 = undefined;
      review.metric3 = undefined;
    }

    if (preferences.teacher.hasComments === false) {
      review.commentText = undefined;
    }
	});

	if (review.isCourseReview === true) {
		res.status(400).json({error: err, message: "Course reviews are not to be modified in the teacher reviews route!"});
	} else {
		Review.findOneAndUpdate({_id: req.params.id}, review, function(err, foundReview) {
			if (err) {
				console.log(err);
				// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
				// res.redirect("/teachers/" + req.params.name);
				res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			} else {
				res.status(200).json({review: foundReview});
			}
		});
	}
});

router.delete("/:name/:id", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);

	Review.findOne({_id: req.params.id}, function(err, foundReview) {
		if (err || foundReview === null || foundReview === undefined || !foundReview || foundReview.isCourseReview === true) {
			// req.flash("error", "Review not found!");
			// res.redirect("/teachers/" + req.params.name);
			res.status(400).json({error: "", message: "Review not found!"});
		}
		else {
			Review.deleteOne({_id: foundReview._id}, function(err, review) {
				if (err) {
					console.log(err);
					// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
					// res.redirect("/teachers/" + req.params.name);
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					Teacher.findOneAndUpdate({_id: foundReview.teacher}, {$pull: {reviews: foundReview._id}}, function(err, updatedTeacher) {
						if (err) {
							console.log(err);
							// req.flash("error", "Oops! Something went wrong. If you think this is an error, please contact us.");
							// res.redirect("/teachers/" + req.params.name);
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						} else {
							// req.flash("success", "Deleted review successfully!");
							// res.redirect("/teachers");
							res.status(204).json();
						}
					});
				}
			});
		}
	});
});

module.exports = router;
