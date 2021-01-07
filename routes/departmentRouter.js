const express = require("express");
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');
const Department = require("./../models/departmentModel");

router.get("/", (req, res) => {
	Department.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/index", {departments});
		}
	});
});

router.get("/new", (req, res) => {
	res.render("departments/new");
});

router.post("/", (req, res) => {
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription
	};
	Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
		if (err) {
			console.log(err);
		}
		else if (!searchResults.length) {
			Department.create(department, (err, newDepartment) => {
				if (err) {
					console.log(err);
				}
				else {
					res.redirect("/departments");
				}
			});
		}
		else {
			console.log("Department already exists!");
			res.redirect("/departments/new");
		}
	});
});

router.get("/:name", (req, res) => {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
      console.log("Department not found!");
      res.redirect("/departments");
    }
		else {
			res.render("departments/show", {department});
		}
	});
});

router.get("/:name/edit", (req, res) => {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
      console.log("Department not found!");
      res.redirect("/departments");
    }
		else {
			res.render("departments/edit", {department});
		}
	});
});

router.put("/:name", (req, res) => {
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription
	};
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, foundDepartment) {
    if (err || foundDepartment === null || foundDepartment === undefined || !foundDepartment) {
      console.log("Department not found!");
      res.redirect("/departments");
    }
		else {
			Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
				if (err) {
					console.log(err);
				}
				else if (!searchResults.length) {
					Department.findOneAndUpdate({name: new RegExp(`^${req.params.name}$`, 'i')}, department, function(err, updatedDepartment) {
						if (err) {
							console.log(err);
						}
						else {
							console.log(updatedDepartment.name + " department updated");
							res.redirect("/departments");
						}
					});
				}
				else {
					console.log("Department already exists!");
					res.redirect("/departments");
				}
			});
		}
	});
});

router.delete("/:name", (req, res) => {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
      console.log("Department not found!");
      res.redirect("/departments");
    }
		else {
			Department.deleteOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err) {
				if (err) {
					console.log(err);
				}
				else {
					if (department.courses.length === 0) {
						console.log("Deleted: " + req.params.name);
						res.redirect("/departments");
		      }
		      else {
						let deleteCourses = new Promise(function(resolve, reject) {
			        department.courses.forEach(async function(course, i) {
								await Course.findOneAndUpdate({_id: course}, {$unset: {department: ""}}, function(err, updatedCourse) {
									if (err) {
										console.log(err);
									}
								});
			          if (i + 1 === department.courses.length) {
			            resolve();
			          }
			        });
			      });

			      deleteCourses.then(function() {
							console.log("Deleted: " + req.params.name);
							res.redirect("/departments");
			      });
					}
				}
			});
		}
	});
});

module.exports = router;
