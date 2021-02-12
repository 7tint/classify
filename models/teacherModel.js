const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
	name: {
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		}
	},
	preferredTitle: {
		type: String,
		required: true
	},
	profilePicture: {
		type: String
	},
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course"
		}
	],
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "TeacherReview"
		}
	]
});

module.exports = mongoose.model("Teacher", teacherSchema);
