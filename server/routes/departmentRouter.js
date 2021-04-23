const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const router = express.Router({mergeParams: true});
const Course = require("./../models/courseModel");
const Department = require("./../models/departmentModel");

function badStr(str) {
  return str.includes("/");
}

const validateDepartment = function(req, res, next) {
  const departmentSchema = Joi.object({
    department: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().allow(null, ""),
    }).required()
  });
  const {error} = departmentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

router.get("/", function(req, res) {
	Department.find({}, function(err, departments) {
		if (err) {
			// console.log(err);
			// req.flash("error", err);
			res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
		}
		else {
			// res.render("departments/index", {departments});
			res.json({departments: departments});
		}
	});
});

// router.get("/new", (req, res) => {
// 	res.render("departments/new");
// });

router.post("/", validateDepartment, function(req, res) {
	if (badStr(req.body.department.name)) {
    // req.flash("error", "Please don't include a '/' in the department name!");
    // res.redirect("/departments/new");
		res.status(400).json({error: "", message: "Please don't include a '/' in the department name!"});
  } else {
		const department = req.body.department;
		Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
			if (err) {
				// console.log(err);
				// req.flash("error", err);
        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			}
			else if (!searchResults.length) {
				Department.create(department, function(err, newDepartment) {
					if (err) {
						// console.log(err);
						// req.flash("error", err);
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else {
						// res.redirect("/departments");
						res.status(201).json({department: newDepartment});
					}
				});
			}
			else {
				// console.log("Department already exists!");
				// req.flash("error", "Department already exists!");
				// res.redirect("/departments/new");
				res.status(400).json({error: "", message: "Department already exists!"});
			}
		});
	}
});

router.get("/:name", function(req, res) {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
			// console.log("Department not found!");
			// req.flash("error", "Department not found!");
      // res.redirect("/departments");
			res.status(400).json({error: "", message: "Department not found!"});
    }
		else {
			//res.render("departments/show", {department});
			res.json({department: department});
		}
	});
});

// router.get("/:name/edit", (req, res) => {
// 	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
// 		if (err || department === null || department === undefined || !department) {
// 			console.log("Department not found!");
// 			req.flash("error", "Department not found!");
//       res.redirect("/departments");
//     }
// 		else {
// 			res.render("departments/edit", {department});
// 		}
// 	});
// });

router.put("/:name", validateDepartment, function(req, res) {
	if (badStr(req.body.department.name)) {
    // req.flash("error", "Please don't include a '/' in the department name!");
    // res.redirect("/departments");
		res.status(400).json({error: "", message: "Please don't include a '/' in the department name!"});
	} else {
		const department = req.body.department;
		Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, foundDepartment) {
			if (err || foundDepartment === null || foundDepartment === undefined || !foundDepartment) {
				// console.log("Department not found!");
				// req.flash("error", "Department not found!");
				// res.redirect("/departments");
				res.status(400).json({error: "", message: "Department not found!"});
			}
			else {
				Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
					if (err) {
						// console.log(err);
						// req.flash("error", err);
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else if (!searchResults.length || (department.name === req.params.name)) {
						Department.findOneAndUpdate({name: new RegExp(`^${req.params.name}$`, 'i')}, department, function(err, updatedDepartment) {
							if (err) {
								// console.log(err);
								// req.flash("error", err);
								res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
							}
							else {
								// console.log(updatedDepartment.name + " department updated");
								// req.flash("sucess", updatedDepartment.name + " department updated!");
								// res.redirect("/departments");
								res.status(200).json({department: updatedDepartment});
							}
						});
					}
					else {
						// console.log("Department already exists!");
						// req.flash("error", "Department already exists!");
						// res.redirect("/departments");
						res.status(400).json({error: "", message: "Department already exists!"});
					}
				});
			}
		});
	}
});

router.delete("/:name", function(req, res) {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
			// console.log("Department not found!");
			// req.flash("error", "Department not found!");
      // res.redirect("/departments");
			res.status(400).json({error: "", message: "Department not found!"});
    }
		else {
			Department.deleteOne({name: new RegExp(`^${req.params.name}$`, 'i')}, async function(err) {
				if (err) {
					// console.log(err);
					// req.flash("error", err);
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					if (department.courses.length === 0) {
						// console.log("Deleted: " + req.params.name);
						// req.flash("sucess", "Deleted: " + req.params.name);
						// res.redirect("/departments");
						res.status(204).json();
		      }
		      else {
						let promises = department.courses.map(async function(course) {
	            await Course.findOneAndUpdate({_id: course}, {$unset: {department: ""}}, function(err, updatedCourse) {
								if (err) {
									// console.log(err);
									// req.flash("error", err);
									res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
								}
							});
		        });

		        await Promise.all(promises);
						// console.log("Deleted: " + req.params.name);
						// req.flash("success", "Deleted: " + req.params.name);
						// res.redirect("/departments");
						res.status(204).json();
					}
				}
			});
		}
	});
});

module.exports = router;
