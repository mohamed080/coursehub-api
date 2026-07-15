const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  next();
};

const createCouponValidator = [
  body("code").notEmpty().withMessage("Coupon code required"),

  body("type").isIn(["percentage", "fixed"]).withMessage("Invalid coupon type"),

  body("value").isNumeric().withMessage("Value must be number"),

  validate,
];

module.exports = {
  createCouponValidator,
};
