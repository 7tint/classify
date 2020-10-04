const express = require('express');
const router = express.Router({mergeParams: true});
const Course = require('./../models/courseModel');

router.get('/create-new-course', (req, res) => {
  Course.create({
    name: "Course 5",
    code: "mpm5u",
    description: "Hello",
    grade: 9,
  }, function(err, course) {
      if (err) {
        console.log(err);
      } else {
        console.log(course);
      }
  });
  res.render("admin-dashboard");
})


module.exports = router;
