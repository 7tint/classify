const express = require("express");
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost/course_catalogue", {useNewUrlParser: true, useUnifiedTopology: true});

// Host and port
const http = require("http");
const hostname = "127.0.0.1";
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Routes
const courseRouter = require("./routes/courseRouter.js");
const preferencesRouter = require("./routes/preferencesRouter.js");

//app.use("/create-new-course", courseRouter);

app.post("/update-course-preferences", function(req, res) {
  var coursePreferences = {
    hasDescription: req.body.course_hasDescription,
  	hasPace: req.body.course_hasPace,
  	hasAntiReq: req.body.course_hasAntiReq,
  	hasCoreReq: req.body.course_hasCoreReq,
  	hasMetrics: req.body.course_hasMetrics,
  	hasComments: req.body.course_hasComments
  };

  // Create a new preference object in DB
  CoursePreferences.create(coursePreferences, function(err, updatedPreferences) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("New course preferences: " + updatedPreferences);
      res.redirect("/admin-dashboard");
    }
  });
});

app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

app.get("/admin-dashboard", function(req, res) {
  res.render("admin-dashboard");
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
