const express = require("express");
const router = express.Router({ mergeParams: true });
const Teacher = require("./../models/teacherModel");
const Review = require("./../models/reviewModel");
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
	res.render("teachers/new");
});

router.post("/", function(req, res) {
	const teacher = {
		name: {
			firstName: req.body.teacherFirstName,
			lastName: req.body.teacherLastName
		},
		preferredTitle: req.body.preferredTitle,
		profilePicture: req.body.profilePicture
	};

	Teacher.find({ name: new RegExp(`^${teacher.name}$`, 'i') }, function(err, searchResults) {
		if (err) {
			console.log(err);
			req.flash("error", err);
		}
		else if (!searchResults.length) {
			Teacher.create(teacher, function(err, newTeacher) {
				if (err) {
					console.log("ERROR while creating teacher object!");
					req.flash("error", "ERROR while creating teacher object!");
					console.log(err);
				}
				else {
					console.log("Teacher created!");
					req.flash("success", "Teacher created!");
					res.redirect("/teachers");
				}
			});
		}
		else {
			console.log("Teacher already exists!");
			req.flash("error", "Teacher already exists!");
			res.redirect("/teachers/new");
		}
	});
});

router.get("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
      res.redirect("/teachers");
    }
		else {
			res.render("teachers/show", { teacher });
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
			res.render("teachers/edit", { teacher });
		}
	});
});

router.put("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	const teacher = {
		name: {
			firstName: req.body.teacherFirstName,
			lastName: req.body.teacherLastName
		},
		prefferedTitle: req.body.prefferedTitle,
		profilePicture: req.body.profilePicture
	};

	Teacher.findOne({name: nameObject}, function(err, teacherFound) {
		if (err || teacherFound === null || teacherFound === undefined || !teacherFound) {
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
      res.redirect("/teachers");
    }
		else {
			Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, function(err, searchResults) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				}
				else if (!searchResults.length) {
					Teacher.findOneAndUpdate({name: nameObject}, teacher, function(err) {
						if (err) {
							console.log(err);
							req.flash("error", err);
						}
						else {
							res.redirect("/teachers");
						}
					});
				}
				else {
					console.log("Teacher already exists!");
					req.flash("error", "Teacher already exists!");
					res.redirect("/teachers/new");
				}
			});
		}
	})
});

router.delete("/:name", function(req, res) {
	var nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			console.log("Teacher not found!");
			req.flash("error", "Teacher not found!");
      res.redirect("/teachers");
    }
		else {
			Teacher.deleteOne({ name: nameObject }, function(err, deletedTeacher) {
				if (err) {
					console.log(err);
					req.flash("error", err);
				}
				else {
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
  
  
router.post("/:name/review", function(req, res) {
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

    Preferences.findOne({}, function(err, preferences) {
        if (preferences.teacher.approveComments === false) {
          review.isApproved = true;
        } else {
          review.isApproved = false;
        }
    });

    Teacher.findOne({name: nameObject}, function(err, teacher) {
        if (err || teacher === null || teacher === undefined || !teacher) {
						console.log("Teacher Not Found!");
						req.flash("error", "Teacher Not Found!");
            res.redirect("/teachers");
        } else {
            review.teacher = teacher.id;

            Review.create(review, function(err) {
                if (err) {
                        console.log("ERROR while creating review object!");
                        req.flash("error", "ERROR while creating review object!");
                    console.log(err);
                }
                else {
                        console.log("Review created!");
                        req.flash("success", "Review created!");
                    res.redirect("/teachers");
                }
            });
        }
    });
  
	  // could limit people to certain num of comments here
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

router.put("/:name/:id/edit", function(req, res) {
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
    
    Preferences.findOne({}, function(err, preferences) {
        if (preferences.teacher.approveComments === false) {
          review.isApproved = true;
        } else {
          review.isApproved = false;
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
                    console.log("Review updated successfully");
                    req.flash("success", "Review updated successfully");
                    res.redirect("/teachers");
                    } 
                }
            });
        }
	});
});


module.exports = router;
