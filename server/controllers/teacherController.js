const Teacher = require("./../models/teacherModel");
const Review = require("./../models/reviewModel");
const Course = require("./../models/courseModel");
const Preferences = require("./../models/preferencesModel");

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

function badStr(str) {
  return (/[^a-zA-Z0-9-._~]/.test(str));
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.teachersGet = function(req, res) {
	if (req.query.search) {
    const regex = escapeRegex(req.query.search);
		Teacher.aggregate([
			{$project: {fullname: {$concat: ["$name.firstName", ' ', "$name.lastName"]}}},
			{$match: {fullname: {$regex: regex, $options: 'i'}}}
		]).exec(function(err, teachers) {
			res.json({teachers: teachers})
		});
  } else {
		Teacher.find({}, function(err, teachers) {
			if (err) {
				console.log(err);
				res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			}
			else {
				res.json({teachers: teachers})
			}
		});
	}
}

exports.teacherPost = function(req, res) {
	if (badStr(req.body.teacher.name.firstName) || badStr(req.body.teacher.name.lastName)) {
		res.status(400).json({error: "", message: "Please don't include special characters in the teacher name!"});
	} else {
		const teacher = req.body.teacher;
		let isValid = true;
		let courseids = new Array();

		Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
			if (err) {
				console.log(err);
				res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			}
			else if (!searchResults.length) {
				if (teacher.courses) {
					await Promise.all(teacher.courses.map(async function(course) {
						let foundCourse = await Course.findOne({code: course});
						if (foundCourse === null || foundCourse === undefined || !foundCourse) {
							isValid = false;
						} else {
							courseids.push(foundCourse._id);
						}
					}));
				}

				if (isValid) {
					teacher.courses = courseids;

					Teacher.create(teacher, async function(err, newTeacher) {
						if (err) {
							console.log(err);
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
						else {
							await Promise.all(teacher.courses.map(async function(course) {
								await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: newTeacher._id}}, function(err, updatedCourse) {
									if (err) {
										console.log(err);
										res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
									}
								});
							}));
							res.status(201).json({teacher: newTeacher});
						}
					});
				} else {
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
			}
			else {
				console.log("Teacher already exists!");
				res.status(400).json({error: "", message: "Teacher already exists!"});
			}
		});
	}
}

exports.teacherGet = function(req, res) {
	const nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}).populate("reviews").populate("courses").exec(function(err, teacher) {
		if (err || teacher === null || teacher === undefined || !teacher) {
			res.status(400).json({error: "", message: "Teacher not found!"});
		}
		else {
			res.json({teacher: teacher});
		}
	});
}

exports.teacherPut = function(req, res) {
	console.log(req.body);
	if (badStr(req.body.teacher.name.firstName) || badStr(req.body.teacher.name.lastName)) {
		res.status(400).json({error: "", message: "Please don't include special characters in the teacher name!"});
	} else {
		const nameObject = convertNametoObj(req.params.name);
		const teacher = req.body.teacher;
		let isValid = true;
		let courseids = new Array();

		Teacher.findOne({name: nameObject}, function(err, foundTeacher) {
			if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
				res.status(400).json({error: "", message: "Teacher not found!"});
			}
			else {
				Teacher.find({name: new RegExp(`^${teacher.name}$`, 'i')}, async function(err, searchResults) {
					if (err) {
						console.log(err);
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else if (!searchResults.length) {
						if (teacher.courses) {
							await Promise.all(teacher.courses.map(async function(course) {
								let foundCourse = await Course.findOne({code: course});
								if (foundCourse === null || foundCourse === undefined || !foundCourse) {
									isValid = false;
								} else {
									courseids.push(foundCourse._id);
								}
							}));
						}

						if (isValid) {
							teacher.courses = courseids;
							Teacher.findOneAndUpdate({name: nameObject}, teacher, async function(err, updatedTeacher) {
								if (err) {
									console.log(err);
									res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
								}
								else {
									if (foundTeacher.courses) {
										await Promise.all(foundTeacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
												}
											});
										}));
									}
									if (teacher.courses) {
										await Promise.all(teacher.courses.map(async function(course) {
											await Course.findOneAndUpdate({_id: course}, {$addToSet: {teachers: updatedTeacher._id}}, function(err, updatedCourse) {
												if (err) {
													console.log(err);
													res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
												}
											});
										}));
									}
									res.status(200).json({teacher: updatedTeacher});
								}
							});
						} else {
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
					}
					else {
						res.status(400).json({error: "", message: "Teacher name already exists!"});
					}
				});
			}
		});
	}
}

exports.teacherDelete = function(req, res) {
	var nameObject = convertNametoObj(req.params.name);
	Teacher.findOne({name: nameObject}, async function(err, foundTeacher) {
		if (err || foundTeacher === null || foundTeacher === undefined || !foundTeacher) {
			res.status(400).json({error: "", message: "Teacher not found!"});
		}
		else {
			if (foundTeacher.courses) {
				await Promise.all(foundTeacher.courses.map(async function(course) {
					await Course.findOneAndUpdate({_id: course}, {$pull: {teachers: foundTeacher._id}}, function(err, updatedCourse) {
						if (err) {
							console.log(err);
							res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
						}
					});
				}));
			}
			Teacher.deleteOne({name: nameObject}, async function(err, deletedTeacher) {
				if (err) {
					console.log(err);
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					if (foundTeacher.reviews) {
						await Promise.all(foundTeacher.reviews.map(async function(review) {
							await Review.deleteOne({_id: review}, function(err, deletedReview) {
								console.log(err);
								res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
							});
						}));
					}
					res.status(204).json();
				}
			});
		}
	});
}
