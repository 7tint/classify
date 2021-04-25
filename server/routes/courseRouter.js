const express = require("express");
const router = express.Router({mergeParams: true});
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const courseController = require('../controllers/courseController');
const reviewController = require('../controllers/reviewController');

function validateCourse(req, res, next) {
  const courseSchema = Joi.object({
    course: Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
      description: Joi.string().allow(null, ""),
      grade: Joi.number().required().min(0),
      pace: Joi.string().allow(null, ""),
      prereq: Joi.array().items(Joi.string()),
      department: Joi.objectId()
    }).required()
  });
  const {error} = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

function validateReview(req, res, next) {
  const reviewSchema = Joi.object({
    review: Joi.object({
      course: Joi.objectId(),
      metric1: Joi.number(),
      metric2: Joi.number(),
      metric3: Joi.number(),
      commentText: Joi.string().allow(null, ""),
      isAnonymous: Joi.boolean().required(),
    }).required()
  });
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

// Courses Routes
router.get("/", courseController.coursesGet);
router.post("/", validateCourse, courseController.coursePost);
router.get("/:code", courseController.courseGet);
router.put("/:code", validateCourse, courseController.coursePut);
router.delete("/:code", courseController.courseDelete);

// Course Review Routes
router.post("/:code/reviews", validateReview, reviewController.courseReviewPost);
router.get("/:code/reviews/:id", reviewController.courseReviewGet);
router.put("/:code/reviews/:id", validateReview, reviewController.courseReviewPut);
router.delete("/:code/reviews/:id", reviewController.courseReviewDelete);

module.exports = router;
