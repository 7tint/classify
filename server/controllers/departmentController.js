const Course = require("./../models/courseModel");
const Department = require("./../models/departmentModel");

function badStr(str) {
  return (/[^a-zA-Z0-9-._~]/.test(word));
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.departmentsGet = function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Department.find({$or: [{name: regex}, {description: regex}]}, function(err, departments) {
  		if (err) {
        console.log(err);
  			res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
  		}
  		else {
  			res.json({departments: departments});
  		}
  	});
  } else {
  	Department.find({}, function(err, departments) {
  		if (err) {
        console.log(err);
  			res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
  		}
  		else {
  			res.json({departments: departments});
  		}
  	});
  }
}

exports.departmentPost = function(req, res) {
	if (badStr(req.body.department.name)) {
		res.status(400).json({error: "", message: "Please don't include special characters in the department name!"});
  } else {
		const department = req.body.department;
		Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
			if (err) {
        res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			}
			else if (!searchResults.length) {
				Department.create(department, function(err, newDepartment) {
					if (err) {
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else {
						res.status(201).json({department: newDepartment});
					}
				});
			}
			else {
				res.status(400).json({error: "", message: "Department already exists!"});
			}
		});
	}
}

exports.departmentGet = function(req, res) {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
			res.status(400).json({error: "", message: "Department not found!"});
    }
		else {
			res.json({department: department});
		}
	});
}

exports.departmentPut = function(req, res) {
	if (badStr(req.body.department.name)) {
		res.status(400).json({error: "", message: "Please don't include special characters in the department name!"});
	} else {
		const department = req.body.department;
		Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, foundDepartment) {
			if (err || foundDepartment === null || foundDepartment === undefined || !foundDepartment) {
				res.status(400).json({error: "", message: "Department not found!"});
			}
			else {
				Department.find({name: new RegExp(`^${department.name}$`, 'i')}, function(err, searchResults) {
					if (err) {
						res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
					}
					else if (!searchResults.length || (department.name === req.params.name)) {
						Department.findOneAndUpdate({name: new RegExp(`^${req.params.name}$`, 'i')}, department, function(err, updatedDepartment) {
							if (err) {
								res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
							}
							else {
								res.status(200).json({department: updatedDepartment});
							}
						});
					}
					else {
						res.status(400).json({error: "", message: "Department already exists!"});
					}
				});
			}
		});
	}
}

exports.departmentDelete = function(req, res) {
	Department.findOne({name: new RegExp(`^${req.params.name}$`, 'i')}, function(err, department) {
		if (err || department === null || department === undefined || !department) {
			res.status(400).json({error: "", message: "Department not found!"});
    }
		else {
			Department.deleteOne({name: new RegExp(`^${req.params.name}$`, 'i')}, async function(err) {
				if (err) {
					res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
				}
				else {
					if (department.courses.length === 0) {
						res.status(204).json();
		      }
		      else {
						let promises = department.courses.map(async function(course) {
	            await Course.findOneAndUpdate({_id: course}, {$unset: {department: ""}}, function(err, updatedCourse) {
								if (err) {
									res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
								}
							});
		        });

		        await Promise.all(promises);
						res.status(204).json();
					}
				}
			});
		}
	});
}
