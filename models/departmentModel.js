const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
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
			type: String,
			required: true
		}
	],
	teachers: [
		{
			type: String,
			required: true
		}
	]
});

module.exports = mongoose.model("Department", departmentSchema);
