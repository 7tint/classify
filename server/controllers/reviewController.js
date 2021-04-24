const Course = require("./../models/courseModel");
const Teacher = require("./../models/teacherModel");
const Department = require("./../models/departmentModel");
const Preferences = require("./../models/preferencesModel");
const Review = require("./../models/reviewModel");

exports.courseReviewPost = async function(req, res) {
  const review = req.body.review;
  review.isCourseReview = true;
	review.email = "example@domain.com";

  await Preferences.findOne({}, function(err, preferences) {
    if (preferences.course.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.course.hasMetrics === false) {
      review.metric1 = undefined;
      review.metric2 = undefined;
      review.metric3 = undefined;
    }

    if (preferences.course.hasComments === false) {
      review.commentText = undefined;
    }
  });

  Course.findOne({code: req.params.code}, function(err, foundCourse) {
    if (err || foundCourse === null || foundCourse === undefined || !foundCourse) {
      res.status(400).json({error: "", message: "Course not found!"});
    }
    else {
      review.course = foundCourse._id;

      Review.create(review, function(err, newReview) {
        if (err) {
          console.log(err);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          Course.findOneAndUpdate({code: req.params.code}, {$addToSet: {reviews: newReview._id}}, function(err, updatedCourse) {
            if (err) {
              console.log(err);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              res.status(201).json({review: newReview});
            }
          });
        }
      });
    }
  });
}

exports.courseReviewPut = async function(req, res) {
  const review = req.body.review;

  await Preferences.findOne({}, function(err, preferences) {
    if (preferences.course.approveComments === false) {
      review.isApproved = true;
    } else {
      review.isApproved = false;
    }

    if (preferences.isAnonymous === true) {
      review.isAnonymous = true;
    }

    if (preferences.course.hasMetrics === false) {
      review.metric1 = undefined;
      review.metric2 = undefined;
      review.metric3 = undefined;
    }

    if (preferences.course.hasComments === false) {
      review.commentText = undefined;
    }
  });

  if (review.isCourseReview === false) {
		res.status(400).json({error: err, message: "Teacher reviews are not to be modified in the course reviews route!"});
	} else {
		Review.findOneAndUpdate({_id: req.params.id}, review, function(err, foundReview) {
			if (err) {
				console.log(err);
				res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
			} else {
				res.status(200).json({review: foundReview});
			}
		});
	}
}

exports.courseReviewDelete = function(req, res) {
  Review.findOne({_id: req.params.id}, function(err, foundReview) {
    if (err || foundReview === null || foundReview === undefined || !foundReview || foundReview.isCourseReview === false) {
      res.status(400).json({error: "", message: "Review not found!"});
    }
    else {
      Review.deleteOne({_id: foundReview._id}, function(err, review) {
        if (err) {
          console.log(err);
          res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
        }
        else {
          Course.findOneAndUpdate({_id: foundReview.course}, {$pull: {reviews: foundReview._id}}, function(err, updatedCourse) {
            if (err) {
              console.log(err);
              res.status(500).json({error: err, message: "Oops! Something went wrong. If you think this is an error, please contact us."});
            } else {
              res.status(204).json();
            }
          });
        }
      });
    }
  });
}
