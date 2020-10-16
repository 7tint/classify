const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course"
		}
	]
});

module.exports = mongoose.model("Department", departmentSchema);
