const express = require('express');
const router = express.Router({mergeParams: true});
const Teacher = require('./../models/teacherModel');

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
  }

  return name
}

router.get("/", function(req, res) {
  Teacher.find({}, function(err, allTeachers) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers/index", {teachers: allTeachers});
    }
  });
});

router.get("/new", function(req, res) {
  Course.find({}, function(err, allTeachers) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers/new", {teachers: allTeachers});
    }
  });
});

router.post("/", function(req, res) {
  var teacher = {
    // change to teacher fields from new ejs file
    name: req.body.courseName,
    code: req.body.courseCode,
    description: req.body.courseDescription,
    grade: req.body.courseGrade,
    pace: req.body.coursePace,
    prereq: req.body.coursePrerequisites
  };

  // Search for existing teachers with the name to check for duplicates
  Teacher.find({name: teacher.name}, function(err, searchResults) {
    // If no results are found, proceed
    if (searchResults.length) {
        console.log("Teacher already exists!");
        res.redirect("/teachers/new");
    }
  });
});

router.get("/:name", function(req, res) {
  var nameObject = convertNametoObj(req.params.name);
  console.log(nameObject);

  Teacher.findOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, teacher) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers/show", { teacher: teacher });
    }
  });
});

router.get("/:name/edit", function(req, res) {
  Course.findOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, teacher) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers/edit", { teacher: teacher });
    }
  });
});

router.put("/:name", function(req, res) {
  console.log("Put");
});

router.delete("/:name", function(req, res) {
  Course.deleteOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, deletedTeacher) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("Deleted: " + req.params.name.firstName + req.params.name.lastName);
      res.redirect("/teachers/index");
    }
  });
});

module.exports = router;
