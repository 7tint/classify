const express = require("express");
const router = express.Router({mergeParams: true});
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const adminController = require('../controllers/adminController');

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

router.get("/", adminController.preferencesGet);
router.put("/", validatePreferences, adminController.preferencesPut);

module.exports = router;
