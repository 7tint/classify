const express = require("express");
const app = express();
const courseRouter = require('./routes/courses');

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/course_catalogue", {useNewUrlParser: true, useUnifiedTopology: true});

const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

app.set('view engine', 'ejs');

// Routers for courses
app.use('/courses', courseRouter);

app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
