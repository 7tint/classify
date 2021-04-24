const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const router = express.Router({mergeParams: true});
const departmentController = require('../controllers/departmentController');

const validateDepartment = function(req, res, next) {
  const departmentSchema = Joi.object({
    department: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().allow(null, ""),
    }).required()
  });
  const {error} = departmentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    res.status(400).json({error: error, message: msg});
  } else {
    next();
  }
}

router.get("/", departmentController.departmentsGet);
router.post("/", validateDepartment, departmentController.departmentPost);
router.get("/:name", departmentController.departmentGet);
router.put("/:name", validateDepartment, departmentController.departmentPut);
router.delete("/:name", departmentController.departmentDelete);

module.exports = router;
