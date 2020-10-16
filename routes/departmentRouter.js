const express = require("express");
const router = express.Router({ mergeParams: true });
const Department = require("./../models/departmentModel");
const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");

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

///////// THE ASYNC WAY
// router.get("/new", async (req, res) => {
// 	const courses = await Course.find({});
// 	const teachers = await Teacher.find({});
// 	res.render("departments/new", { courses, teachers });
// });

router.get("/new", (req, res) => {
	Course.find({}, (err, courses) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/new", { courses });
		}
	});
});

router.post("/", (req, res) => {
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription,
		courses: req.body.departmentCourses,
		teachers: req.body.departmentTeachers
	};
	Department.create(department, (err, newDepartment) => {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect("/departments");
		}
	});
});

router.get("/:name", (req, res) => {
	const { name } = req.params;
	Department.findOne({ name }, function(err, department) {
		if (err) {
			console.log(err);
		}
		else {
			res.render("departments/show", { department });
			console.log(department);
		}
	});
});

////////////THE ASYNC WAY
// router.get("/:name/edit", async (req, res) => {
// 	const courses = await Course.find({});
// 	const teachers = await Teacher.find({});
// 	const { name } = req.params;
// 	Department.findOne({ name }, function(err, department) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			res.render("departments/edit", { department, courses, teachers });
// 		}
// 	});
// });

router.get("/:name/edit", (req, res) => {
	const { name } = req.params;

	Course.find({}, (err, courses) => {
		if (err) {
			console.log(err);
		} else {
			Teacher.find({}, (err, teachers) => {
				if (err) {
					console.log(err);
				} else {
					Department.findOne({ name }, function(err, department) {
						if (err) {
							console.log(err);
						} else {
							res.render("departments/edit", { department, courses, teachers });
						}
					});
				}
			});
		}
	});
});

router.put("/:name", (req, res) => {
	const { name } = req.params;
	const department = {
		name: req.body.departmentName,
		description: req.body.departmentDescription,
		courses: req.body.departmentCourses,
		teachers: req.body.departmentTeachers
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
