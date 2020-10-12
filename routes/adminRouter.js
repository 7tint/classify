const express = require('express');
const router = express.Router({mergeParams: true});
const Preferences = require("./../models/preferencesModel.js");
const Course = require("./../models/courseModel.js");

// *********** //
// PREFERENCES //
// *********** //
router.get("/", function(req, res) {
  Preferences.findOne({}, function(err, retrievedPreferences) {
    if (err) {
      console.log("ERROR while retrieving preferences!");
      console.log(err);
    }
    else {
      if (retrievedPreferences === null) {
        res.render("admin-dashboard", {
          isPublicVar: true,
          courseMetricsVar: true,
          courseCommentsVar: true,
          teacherMetricsVar: true,
          teacherCommentsVar: true,
          isAnonymousVar: true
        });
      }
      else {
        res.render("admin-dashboard", {
          isPublicVar: retrievedPreferences.isPublic,
          courseMetricsVar: retrievedPreferences.course.hasMetrics,
          courseCommentsVar: retrievedPreferences.course.hasComments,
          teacherMetricsVar: retrievedPreferences.teacher.hasMetrics,
          teacherCommentsVar: retrievedPreferences.teacher.hasComments,
          isAnonymousVar: retrievedPreferences.isAnonymous
        });
      }
    }
  });
});

router.post("/", function(req, res) {
  var preferences = {
    isPublic: req.body.isPublic,
  	course: {
      hasMetrics: req.body.course_hasMetrics,
      hasComments: req.body.course_hasComments
    },
    teacher: {
      hasMetrics: req.body.teacher_hasMetrics,
      hasComments: req.body.teacher_hasComments
    }
  };

  // If there are no course/teacher metrics and comments, set anonymous reviews as true as default.
  if (((preferences.course.hasMetrics === 'false') && (preferences.course.hasComments === 'false')) &&
      ((preferences.teacher.hasMetrics === 'false') && (preferences.teacher.hasComments === 'false'))) {
    console.log("Metrics and comments are disabled.");
    preferences.isAnonymous = true;
  }

  else {
    preferences.isAnonymous = req.body.isAnonymous;
  }

  // Delete all existing preference objects
  Preferences.replaceOne({}, preferences, null, function(err, docs) {
    if (err) {
      console.log("ERROR while deleting preference objects!");
      console.log(err);
    }
    else {
      console.log("Replaced old preferences: ", docs);
      res.redirect("/admin");
    }
  });
});


// ******* //
// COURSES //
// ******* //
router.get("/courses/new", function(req, res) {
  Course.find({}, function(err, allCourses) {
    if (err) {
      console.log(err);
    }
    else {
      res.render("admin-courses", {courses: allCourses});
    }
  });
});


module.exports = router;
