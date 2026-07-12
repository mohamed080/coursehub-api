const { body } = require("express-validator");

const createCourseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be true or false"),
];

module.exports = {
  createCourseValidation,
};
