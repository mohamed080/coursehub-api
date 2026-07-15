const { param } = require("express-validator");

const checkoutValidator = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course id"),
];

module.exports = {
  checkoutValidator,
};