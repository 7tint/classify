const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const uri = process.env.URI;

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

// Host and port
const http = require("http");
const hostname = "127.0.0.1";
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static node module files
// app.use('/modules', express.static(path.join(__dirname, 'node_modules/')));

// Require routes
const courseRouter = require("./routes/courseRouter.js");
const adminRouter = require("./routes/adminRouter.js");
const teacherRouter = require("./routes/teacherRouter.js");
const departmentRouter = require("./routes/departmentRouter.js");
const departmentCourseRouter = require("./routes/relationsRouter.js");

// Routes
app.use("/admin", adminRouter);
app.use("/courses", courseRouter);
app.use("/teachers", teacherRouter);
app.use("/departments", departmentRouter);
app.use("/classify-courses", departmentCourseRouter);

app.get("/", function(req, res) {
	res.render("home");
});

app.listen(port, hostname, function() {
	console.log(`Server running at http://${hostname}:${port}/`);
});
