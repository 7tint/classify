const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const router = express.Router({ mergeParams: true });
const teacherController = require('../controllers/teacherController');
const reviewController = require('../controllers/reviewController');

function validateTeacher(req, res, next) {
  const teacherSchema = Joi.object({
    teacher: Joi.object({
      name: Joi.object({
				firstName: Joi.string().required(),
				lastName: Joi.string().required()
			}).required(),
      preferredTitle: Joi.string().required(),
      profilePicture: Joi.string().allow(null, ""),
      courses: Joi.array().items(Joi.objectId())
    }).required()
  });
  const {error} = teacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
		console.log(msg);
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

// Teacher Routes
router.get("/", teacherController.teachersGet);
router.post("/", validateTeacher, teacherController.teacherPost);
router.get("/:name", teacherController.teacherGet);
router.put("/:name", validateTeacher, teacherController.teacherPut);
router.delete("/:name", teacherController.teacherDelete);

// Teacher Review Routes
router.post("/:name/reviews", validateReview, reviewController.teacherReviewPost);
router.get("/:name/reviews/:id", reviewController.teacherReviewGet);
router.delete("/:name/reviews/:id", reviewController.teacherReviewDelete);

module.exports = router;
