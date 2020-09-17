var express = require("express");
var app = express();

const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
