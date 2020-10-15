const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");

router.get("/", async (req, res) => {
	const departments = await Department.find({});
	res.render("departments/index", { departments });
});

router.get("/new", (req, res) => {
	res.render("departments/new");
});

router.post("/", async (req, res) => {
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription,
		courses: [req.body.departmentCourses], //fix later need to make the slections
		teachers: [req.body.departmentTeachers] //fix later
	};
	const newDepartment = new Department(department);
	await newDepartment.save();
	res.redirect("/departments");
});

router.get("/:name", (req, res) => {
	const { name } = req.params;
	Department.findOne({ name }, function(err, department) {
		if (err) {
			console.log(err);
		} else {
			res.render("departments/show", { department });
		}
	});
});

router.get("/:name/edit", (req, res) => {
	const { name } = req.params;
	console.log(req.params);
	Department.findOne({ name }, function(err, department) {
		if (err) {
			console.log(err);
		} else {
			res.render("departments/edit", { department });
		}
	});
});

router.put("/:name", (req, res) => {
	const { name } = req.params;
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription,
		courses: [req.body.departmentCourses], //fix later need to make the slections
		teachers: [req.body.departmentTeachers] //fix later
	};
	Department.findOneAndUpdate({ name }, department, function(err, department) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/departments");
		}
	});
});

router.delete("/:name", (req, res) => {
	const { name } = req.params;
	Department.deleteOne({ name }, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Deleted: " + name);
			res.redirect("/departments");
		}
	});
});

module.exports = router;
