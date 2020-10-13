const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
mongoose.connect("mongodb://localhost/course_catalogue", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
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

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
