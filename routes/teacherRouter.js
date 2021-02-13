const express = require("express");
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

router.get("/", function(req, res) {
	Teacher.find({}, function(err, allTeachers) {
		if (err) {
			console.log(err);
			req.flash("error", err);
		}
		else {
			res.render("teachers/index", { teachers: allTeachers });
		}
	});
});

router.get("/new", function(req, res) {
	Course.find({}, function(err, courses) {
		res.render("teachers/new", {courses});
	})
});

router.post("/", function(req, res) {
	if (badStr(req.body.teacherFirstName) || badStr(req.body.teacherLastName)) {
		req.flash("error", "Please don't include a '/' in the teacher's name!");
    res.redirect("/teachers/new");
	} else {
		const teacher = {
			name: {
				firstName: req.body.teacherFirstName,
				lastName: req.body.teacherLastName
			},
			preferredTitle: req.body.preferredTitle,
			profilePicture: req.body.profilePicture,
			courses: req.body.courses
		};
		let isValid = true;
		let courseids = new Array();
	
		Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
			if (err) {
				console.log(err);
				req.flash("error", err);
			}
			else if (!searchResults.length) {
				if (teacher.courses) {
					await Promise.all(teacher.courses.map(async function(course) {
						let foundCourse = await Course.findOne({code: course});
						if (foundCourse === null || foundCourse === undefined || !foundCourse) {
							req.flash("error", "Oops! Something went wrong.");
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
							console.log("ERROR while creating teacher object!");
							req.flash("error", "ERROR while creating teacher object!");
							console.log(err);
						}
						else {
							await Promise.all(teacher.courses.map(async function(course) {
								await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: newTeacher._id}}, function(err, updatedCourse) {
									if (err) {
										console.log(err);
										req.flash("error", err);
									}
									else {
										console.log("Teacher added to " + course + "!");
										req.flash("Teacher added to " + course + "!");
									}
								});
							}));
							console.log("Teacher created!");
							req.flash("success", "Teacher created!");
							res.redirect("/teachers");
						}
					});
				}
			}
			else {
				console.log("Teacher already exists!");
				req.flash("error", "Teacher already exists!");
				res.redirect("/teachers/new");
			}
		});
	}
});

router.get("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, async function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
			res.redirect("/teachers");
		}
		else {
			const reviews = new Array();

      if (teacher.reviews) {
        await Promise.all(teacher.reviews.map(async function(review) {
          let foundReview = await Review.findOne({_id: review});
          reviews.push(foundReview);
        }));
      }
			res.render("teachers/show", {teacher, reviews});
		}
	});
});

router.get("/:name/edit", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
			res.redirect("/teachers");
		}
		else {
			Course.find({}, function(err, courses) {
				res.render("teachers/edit", { teacher, courses });
			});
		}
	});
});

router.put("/:name", function(req, res) {
	if (badStr(req.body.teacherFirstName) || badStr(req.body.teacherLastName)) {
		req.flash("error", "Please don't include a '/' in the teacher's name!");
    res.redirect("/teachers");
	} else {
		const nameObject = convertNametoObj(req.params.name);
		const teacher = {
			name: {
				firstName: req.body.teacherFirstName,
				lastName: req.body.teacherLastName
			},
			prefferedTitle: req.body.prefferedTitle,
			profilePicture: req.body.profilePicture,
			courses: req.body.courses
		};
		let isValid = true;
		let courseids = new Array();

		Teacher.findOne({name: nameObject}, function(err, foundTeacher) {
			if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
				console.log("Teacher not found!");
				req.flash("error", "Teacher not found!");
				res.redirect("/teachers");
			}
			else {
				Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
					if (err) {
						console.log(err);
						req.flash("error", err);
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
									req.flash("error", err);
								}
								else {
									if (foundTeacher.courses) {
										await Promise.all(foundTeacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													req.flash("error", err);
												}
												else {
													console.log("Teacher removed from " + course + "!");
												}
											});
										}));
									}
									if (teacher.courses) {
										await Promise.all(teacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													req.flash("error", err);
												}
												else {
													console.log("Teacher added to " + course + "!");
												}
											});
										}));
									}
									req.flash("Teacher updated!");
									res.redirect("/teachers");
								}
							});
						} else {
							req.flash("error", "Oops! Something went wrong.");
							res.redirect("/teachers");
						}
					}
					else {
						console.log("Teacher already exists!");
						req.flash("error", "Teacher already exists!");
						res.redirect("/teachers");
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
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
			res.redirect("/teachers");
		}
		else {
			if (foundTeacher.courses) {
				await Promise.all(foundTeacher.courses.map(async function(course) {
					await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: foundTeacher._id}}, function(err, updatedCourse) {
						if (err) {
							console.log(err);
							req.flash("error", err);
						}
						else {
							console.log("Teacher removed from " + course + "!");
						}
					});
				}));
			}
			Teacher.deleteOne({name: nameObject}, async function(err, deletedTeacher) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				}
				else {
					if (foundTeacher.reviews) {
						await Promise.all(foundTeacher.reviews.map(async function(review) {
							await Review.deleteOne({_id: review}, function(err, deletedReview) {
								console.log(err);
								req.flash("error", err);
							});
						}));
					}
					console.log("Deleted: " + nameObject.firstName + "" + nameObject.lastName);
					req.flash("success", "Deleted: " + nameObject.firstName + "" + nameObject.lastName);
					res.redirect("/teachers");
				}
			});
		}
	});
});

/* ------------ START OF TEACHER REVIEW ROUTES ----------------- */

router.get("/:name/reviews/new", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err) {
			console.log(err);
			req.flash("error", err);
		} else {
			res.render("reviews/teacher/new", {teacher});
		}
	});
});


router.post("/:name/review", async function(req, res) {
	const nameObject = convertNametoObj(req.params.name);

	var review = {
		email: "email@domain.com",
		isCourseReview: false,
		metric1: req.body.metric1,
		metric2: req.body.metric2,
		metric3: req.body.metric3,
		commentText: req.body.commentText,
		isAnonymous: req.body.isAnonymous,
	};

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
			console.log("Teacher Not Found!");
			req.flash("error", "Teacher Not Found!");
			res.redirect("/teachers");
		}
		else {
			review.teacher = foundTeacher._id;

			Review.create(review, function(err, newReview) {
				if (err) {
					console.log("ERROR while creating review object!");
					req.flash("error", "ERROR while creating review object!");
					console.log(err);
				}
				else {
					Teacher.findOneAndUpdate({_id: review.teacher}, {$addToSet: {reviews: newReview._id}}, function(err, updatedTeacher) {
            if (err) {
              console.log("ERROR while adding review to teacher!");
              req.flash("error", "ERROR while adding review to teacher!");
            } else {
              console.log("Teacher updated!");
              req.flash("success", "Teacher updated!");
              res.redirect("/teachers");
            }
          });
				}
			});
		}
	});
});


router.get("/:name/:id/edit", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			console.log("Teacher Not Found!");
			req.flash("error", "Teacher Not Found!");
			res.redirect("/teachers");
		}
		else {
			Review.findOne({_id: req.params.id}, function(err, review) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				}
				else {
					if (review.isCourseReview === false) {
						res.render("reviews/teacher/edit", {review, teacher,
							metric1: review.metric1,
							metric2: review.metric2,
							metric3: review.metric3,
							isAnonymous: review.isAnonymous,
						});
					} else {
						console.log("Not a valid teacher review");
						req.flash("error", "Not a valid teacher review!");
						res.redirect("/teachers");
					}
				}
			});
		}
	});
});

router.put("/:name/:id/edit", async function(req, res) {
	const nameObject = convertNametoObj(req.params.name);

	var review = {
		email: "email@domain.com",
		isCourseReview: false,
		metric1: req.body.metric1,
		metric2: req.body.metric2,
		metric3: req.body.metric3,
		commentText: req.body.commentText,
		isAnonymous: req.body.isAnonymous,
	};

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
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
			res.redirect("/teachers");
		}
		else {
			review.teacher = foundTeacher.id;

			Review.findOneAndUpdate({_id: req.params.id}, review, function(err, foundReview) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				} else {
					Teacher.findOneAndUpdate({_id: review.teacher}, {$addToSet: {reviews: foundReview._id}}, function(err, updatedTeacher) {
            if (err) {
              console.log("ERROR while adding review to teacher!");
              req.flash("error", "ERROR while adding review to teacher!");
            } else {
              console.log("Review updated!");
              req.flash("success", "Revieww updated!");
              res.redirect("/teachers");
            }
          });
				}
			});
		}
	});
});

router.delete("/:name/:id", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);

	Review.findOne({_id: req.params.id}, function(err, foundReview) {
		if (err || foundReview === null || foundReview === undefined || !foundReview || foundReview.isCourseReview === true) {
			console.log("Review not found!");
			req.flash("error", "Review not found!");
			res.redirect("/teachers");
		}
		else {
			Review.deleteOne({_id: foundReview._id}, function(err, review) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				}
				else {
					Teacher.findOneAndUpdate({_id: foundReview.teacher}, {$pull: {reviews: foundReview._id}}, function(err, updatedTeacher) {
						if (err) {
							console.log(err);
							req.flash("error", err);
						} else {
							console.log("Deleted review: " + foundReview._id);
							req.flash("success", "Deleted review: " + foundReview._id);
							res.redirect("/teachers");
						}
					});
				}
			});
		}
	});
});

module.exports = router;
