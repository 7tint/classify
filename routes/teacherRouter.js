const express = require('express');
const router = express.Router({mergeParams: true});
const Teacher = require('./../models/teacherModel');

router.get("/", function(req, res) {
  Teacher.find({}, function(err, allTeachers) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teachers", {teachers: allTeachers});
    }
  });
});

router.get("/new", function(req, res) {
  Course.find({}, function(err, allTeachers) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("admin/teacher-new", {teachers: allTeachers});
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
        res.redirect("/teacher/new");
    }
  });
});

router.get("/:name.firstName_:name.lastName", function(req, res) {
  Teacher.findOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, teacher) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("teacher", { teacher: teacher });
    }
  });
});

router.get("/:name.firstName_:name.lastName/edit", function(req, res) {
  Course.findOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, teacher) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("admin/teacher-edit", { teacher: teacher });
    }
  });
});

router.put("/:code", function(req, res) {
  console.log("Put");
});

router.delete("/:name.firstName_:name.lastName/", function(req, res) {
  Course.deleteOne({lastName: req.params.name.lastName, firstName: req.params.firstName}, function(err, deletedTeacher) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("Deleted: " + req.params.name.firstName + req.params.name.lastName);
      res.redirect("/courses");
    }
  });
});

module.exports = router;
