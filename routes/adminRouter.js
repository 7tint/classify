const express = require("express");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const router = express.Router({mergeParams: true});
const Preferences = require("./../models/preferencesModel.js");
const Course = require("./../models/courseModel.js");

function validatePreferences(req, res, next) {
  const preferencesSchema = Joi.object({
    preferences: Joi.object({
      isPublic: Joi.boolean().required(),
      isAnonymous: Joi.boolean().required(),
      course: Joi.object({
				hasMetrics: Joi.boolean().required(),
        hasComments: Joi.boolean().required(),
        approveComments: Joi.boolean().required()
			}).required(),
      teacher: Joi.object({
				hasMetrics: Joi.boolean().required(),
        hasComments: Joi.boolean().required(),
        approveComments: Joi.boolean().required()
			}).required()
    }).required()
  });
  const {error} = preferencesSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

router.get("/", function(req, res) {
  Preferences.findOne({}, function(err, retrievedPreferences) {
    if (err) {
      console.log("ERROR while retrieving preferences!");
      // req.flash("error", "ERROR while retrieving preferences!");
      // console.log(err);
      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    }
    else {
      if (retrievedPreferences === null) {
        // Create default preferences object.
        const defaultPreferences = {
          isPublic: true,
        	course: {
            hasMetrics: true,
            hasComments: true,
            approveComments: false,
          },
          teacher: {
            hasMetrics: true,
            hasComments: true,
            approveComments: false,
          },
          isAnonymous: true
        };

        Preferences.create(defaultPreferences, function(err, createdPreferences) {
          if (err) {
            console.log("ERROR while creating preferences object!");
            // req.flash("error", "ERROR while crearing preferences object!");
            // console.log(err);
            res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            // Redirect to preferences page with an error message
          }
          else {
            console.log("Preferences created!");
            // req.flash("success", "Preferences created!");
            // res.redirect("/admin");
            res.json({preferences: createdPreferences});
          }
        });
      }

      else {
        // res.render("preferences/index", {
        //   isPublicVar: retrievedPreferences.isPublic,
        //   courseMetricsVar: retrievedPreferences.course.hasMetrics,
        //   courseCommentsVar: retrievedPreferences.course.hasComments,
        //   teacherMetricsVar: retrievedPreferences.teacher.hasMetrics,
        //   teacherCommentsVar: retrievedPreferences.teacher.hasComments,
        //   isAnonymousVar: retrievedPreferences.isAnonymous,
        //   approveTeacherCommentsVar: retrievedPreferences.course.approveComments,
        //   approveCourseCommentsVar: retrievedPreferences.teacher.approveComments,
        // });
        res.json({preferences: retrievedPreferences});
      }
    }
  });
});

// router.get("/edit", function(req, res) {
//   Preferences.findOne({}, function(err, retrievedPreferences) {
//     if (err) {
//       console.log("ERROR while retrieving preferences!");
//       req.flash("error", "ERROR while retrieving preferences!");
//       console.log(err);
//     }
//     else {
//       if (retrievedPreferences === null) {
//         // Create default preferences object.
//         const defaultPreferences = {
//           isPublic: true,
//         	course: {
//             hasMetrics: true,
//             hasComments: true,
//             approveComments: false,
//           },
//           teacher: {
//             hasMetrics: true,
//             hasComments: true,
//             approveComments: false,
//           },
//           isAnonymous: true
//         };

//         Preferences.create(defaultPreferences, function(err, createdPreferences) {
//           if (err) {
//             console.log("ERROR while creating preferences object!");
//             req.flash("error", "ERROR while creating preferences object!");
//             console.log(err);
//             // Redirect to preferences page with an error message
//           }
//           else {
//             console.log("Preferences created!");
//             req.flash("success", "Preferences created!");
//             res.redirect("/admin/");
//           }
//         });
//       }

//       else {
//         res.render("preferences/edit", {
//           isPublicVar: retrievedPreferences.isPublic,
//           courseMetricsVar: retrievedPreferences.course.hasMetrics,
//           courseCommentsVar: retrievedPreferences.course.hasComments,
//           teacherMetricsVar: retrievedPreferences.teacher.hasMetrics,
//           teacherCommentsVar: retrievedPreferences.teacher.hasComments,
//           isAnonymousVar: retrievedPreferences.isAnonymous,
//           approveTeacherCommentsVar: retrievedPreferences.course.approveComments,
//           approveCourseCommentsVar: retrievedPreferences.teacher.approveComments,
//         });
//       }
//     }
//   });
// });

router.put("/", validatePreferences, function(req, res) {
  // var preferences = {
  //   isPublic: req.body.isPublic,
  //   isAnonymous: req.body.isAnonymous,
  // 	course: {
  //     hasMetrics: req.body.course.hasMetrics,
  //     hasComments: req.body.course.hasComments,
  //     approveComments: req.body.course.approveComments,
  //   },
  //   teacher: {
  //     hasMetrics: req.body.teacher.hasMetrics,
  //     hasComments: req.body.teacher.hasComments,
  //     approveComments: req.body.teacher.approveComments,
  //   }
  // };
  const preferences = req.body.preferences;

  // If there are no course/teacher metrics and comments, set anonymous reviews as true as default.
  if (((preferences.course.hasMetrics === "false") && (preferences.course.hasComments === "false")) &&
      ((preferences.teacher.hasMetrics === "false") && (preferences.teacher.hasComments === "false"))) {
    console.log("Metrics and comments are disabled.");
    preferences.isAnonymous = true;
  }

  // If comments are off, put approveComments as true as default.
  if (preferences.course.hasComments === "false") {
    preferences.course.approveComments = true;
  }

  if (preferences.teacher.hasComments === "false") {
    preferences.teacher.approveComments = true;
  }

  // Replace one existing preference object
  Preferences.findOneAndUpdate({}, preferences, {upsert: true}, function(err, docs) {
    if (err) {
      console.log("ERROR while deleting preference objects!");
      // req.flash("error", "ERROR while deleting preference objects!");
      // console.log(err);
      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    }
    else {
      // console.log("Replaced old preferences: ", docs);
      // res.redirect("/admin/");
      res.status(200).json({preferences: docs});
    }
  });
});

module.exports = router;
