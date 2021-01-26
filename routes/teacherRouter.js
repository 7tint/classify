const express = require("express");
const router = express.Router({ mergeParams: true });
const Teacher = require("./../models/teacherModel");
const Review = require("./../models/reviewModel");

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
		}
		else if (!searchResults.length) {
			Teacher.create(teacher, function(err, newTeacher) {
				if (err) {
					console.log("ERROR while creating teacher object!");
					console.log(err);
				}
				else {
					console.log("Teacher created!");
					res.redirect("/teachers");
				}
			});
		}
		else {
			console.log("Teacher already exists!");
			res.redirect("/teachers/new");
		}
	});
});

router.get("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
      console.log("Teacher not found!");
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
      res.redirect("/teachers");
    }
		else {
			Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, function(err, searchResults) {
				if (err) {
					console.log(err);
				}
				else if (!searchResults.length) {
					Teacher.findOneAndUpdate({name: nameObject}, teacher, function(err) {
						if (err) {
							console.log(err);
						}
						else {
							res.redirect("/teachers");
						}
					});
				}
				else {
					console.log("Teacher already exists!");
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
      res.redirect("/teachers");
    }
		else {
			Teacher.deleteOne({ name: nameObject }, function(err, deletedTeacher) {
				if (err) {
					console.log(err);
				}
				else {
					console.log("Deleted: " + nameObject.firstName + "" + nameObject.lastName);
					res.redirect("/teachers");
				}
			});
		}
	});
});

/* ------------ START OF TEACHER REVIEW ROUTES ----------------- */

router.get("/:name/reviews/new", function(req, res) {
  Teacher.findOne({name: req.params.name}, function(err, teacher) {
      if (err) {
        console.log(err);
      } else {
        res.render("reviews/new", {teacher});
      }
  });
});
  
router.get("/:name/:id/edit", function(req, res) {
	Teacher.findOne({name: req.params.name}, function(err, teacher) {
        if (err || teacher === null || teacher === undefined || !teacher) {
            console.log("Teacher Not Found!");
            res.redirect("/teachers/:name");
        }
        else {
            Review.findOne({_id: review.teacher}, function(err, review) {
            if (err) {
                console.log(err);
            }
                else {
                res.render("reviews/edit", {review, teacher});
                }
            });
        }
	});
});
  
router.post("/:name/review", function(req, res) {
    Teacher.findOne({name: req.params.name}, function(err, teacher) {
        var teacherCode = teacher.id
    });
    
    var review = {
        email: req.body.email,
        isCourseReview: false,
        isTeacherReview: true,
        teacher: teacherCode,
        metric1: req.body.metric1,
        metric2: req.body.metric2,
        metric3: req.body.metric3,
        commentText: req.body.commentText,
        createdAt: new Date().toLocaleDateString(),
        isAnonymous: req.body.isAnonymous
	};
  
	Review.create(review, function(err) {
	    if (err) {
		    console.log("ERROR while creating review object!");
		    console.log(err);
	    }
	    else {
		    console.log("Review created!");
		    res.redirect("/:name");
	    }
	});
  
	  // could limit people to certain num of comments here
  });
  
router.put("/:name/:id", function(req, res) {
    Teacher.findOne({name: req.params.name}, function(err, teacher) {
        var teacherCode = teacher.id
    });
    
    var review = {
        email: req.body.email,
        isCourseReview: false,
        isTeacherReview: true,
        teacher: teacherCode,
        metric1: req.body.metric1,
        metric2: req.body.metric2,
        metric3: req.body.metric3,
        commentText: req.body.commentText,
        createdAt: new Date().toLocaleDateString(),
        isAnonymous: req.body.isAnonymous
	};
  
	Teacher.findOne({name: req.params.name}, function(err, foundTeacher) {
        if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
            console.log("Teacher not found!");
            res.redirect("/teachers");
        }
        else { 
            Review.findOneAndUpdate({_id: review.course}, function(err, foundReview) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Review updated successfully");
                }
            });
        }
	});
});


module.exports = router;
