const Preferences = require("./../models/preferencesModel.js");
const Course = require("./../models/courseModel.js");

exports.preferencesGet = function(req, res) {
  Preferences.findOne({}, function(err, retrievedPreferences) {
    if (err) {
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
            res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            // Redirect to preferences page with an error message
          }
          else {
            res.json({preferences: createdPreferences});
          }
        });
      }

      else {
        res.json({preferences: retrievedPreferences});
      }
    }
  });
};

exports.preferencesPut = function(req, res) {
  const preferences = req.body.preferences;

  // If there are no course/teacher metrics and comments, set anonymous reviews as true as default.
  if (((preferences.course.hasMetrics === false) && (preferences.course.hasComments === false)) &&
      ((preferences.teacher.hasMetrics === false) && (preferences.teacher.hasComments === false))) {
    preferences.isAnonymous = true;
  }

  // If comments are off, put approveComments as true as default.
  if (preferences.course.hasComments === false) {
    preferences.course.approveComments = true;
  }

  if (preferences.teacher.hasComments === false) {
    preferences.teacher.approveComments = true;
  }

  // Replace one existing preference object
  Preferences.findOneAndUpdate({}, preferences, {upsert: true}, function(err, docs) {
    if (err) {
      res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
    }
    else {
      res.status(200).json({preferences: docs});
    }
  });
}
