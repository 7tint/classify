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

// Require routes
const courseRouter = require("./routes/courseRouter.js");
const adminRouter = require("./routes/adminRouter.js");

// Routes
app.use("/courses", courseRouter);
app.use("/admin", adminRouter);

app.get("/", function(req, res) {
  res.render("home");
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
