const express = require("express");
const router = express.Router({ mergeParams: true });
const Teacher = require("./../models/teacherModel");
const Course = require("./../models/courseModel");

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
  Course.find({}, function(err, courses) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers/new", { courses });
    }
  });
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
});

router.get("/:name", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject }, function(err, teacher) {
		if (err) {
			console.log(err);
		}
    else {
			res.render("teachers/show", { teacher });
		}
	});
});

router.get("/:name/edit", function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject }, function(err, teacher) {
		if (err) {
			console.log(err);
		}
    else {
			Course.find({}, function(err, courses) {
        if (err) {
    			console.log(err);
        }
        else {
  				res.render("teachers/edit", { teacher, courses });
        }
			});
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
		profilePicture: req.body.profilePicture,
		courses: req.body.courses
	};

	Teacher.findOneAndUpdate({name: nameObject}, teacher, function(err) {
		if (err) {
			console.log(err);
		}
    else {
			res.redirect("/teachers");
		}
	});
});

router.delete("/:name", function(req, res) {
	var nameObject = convertNametoObj(req.params.name);
	Teacher.deleteOne({name: nameObject}, function(err, deletedTeacher) {
		if (err) {
			console.log(err);
		}
    else {
			console.log("Deleted: " + nameObject.firstName + "" + nameObject.lastName);
			res.redirect("/teachers");
		}
	});
});

module.exports = router;
