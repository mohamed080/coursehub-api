const { param, query } = require("express-validator");

const courseEnrollmentValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),
];

const enrollmentIdValidation = [
  param("enrollmentId")
    .isMongoId()
    .withMessage("Invalid enrollment ID"),
];

const studentsQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["active", "completed"])
    .withMessage("Status must be active or completed"),
];

module.exports = {
  courseEnrollmentValidation,
  enrollmentIdValidation,
  studentsQueryValidation,
};