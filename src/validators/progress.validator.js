const { param } = require("express-validator");

const lessonProgressValidation = [
  param("lessonId").isMongoId().withMessage("Invalid lesson ID"),
];

const courseProgressValidation = [
  param("courseId").isMongoId().withMessage("Invalid course ID"),
];

module.exports = {
  lessonProgressValidation,
  courseProgressValidation,
};
