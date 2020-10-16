const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");

router.get("/", (req, res) => {
	Department.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/index", { departments });
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
	Department.find({ name: department.name }, function(err, searchResults) {
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
	Department.findOne({ name: req.params.name }, function(err, department) {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/show", { department });
		}
	});
});

router.get("/:name/edit", (req, res) => {
	Department.findOne({ name: req.params.name }, function(err, department) {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/edit", { department });
		}
	});
});

router.put("/:name", (req, res) => {
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription
	};
	Department.find({ name: department.name }, function(err, searchResults) {
		if (err) {
			console.log(err);
		}
		else if (!searchResults.length) {
			Department.findOneAndUpdate({ name: req.params.name }, department, function(err, department) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(department.name + " department updated");
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

router.delete("/:name", (req, res) => {
	const { name } = req.params;
	Department.deleteOne({ name }, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("Deleted: " + name);
			res.redirect("/departments");
		}
	});
});

module.exports = router;
