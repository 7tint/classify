const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");
const Course = require('./../models/courseModel');

router.get("/", function(req, res) {
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

module.exports = router;
