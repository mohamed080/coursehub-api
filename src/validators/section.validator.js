const { body, param, query } = require("express-validator");

const createSectionValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Section title is required")
    .bail()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "Section title must be between 3 and 100 characters",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Section description cannot exceed 500 characters",
    ),

  body("order")
    .notEmpty()
    .withMessage("Section order is required")
    .bail()
    .isInt({
      min: 1,
    })
    .withMessage(
      "Section order must be a positive integer",
    ),
];

const updateSectionValidation = [
  param("sectionId")
    .isMongoId()
    .withMessage("Invalid section ID"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Section title cannot be empty")
    .bail()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "Section title must be between 3 and 100 characters",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Section description cannot exceed 500 characters",
    ),

  body("order")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      "Section order must be a positive integer",
    ),

  body().custom((value) => {
    const allowedFields = [
      "title",
      "description",
      "order",
    ];

    const hasAllowedField = allowedFields.some(
      (field) => value[field] !== undefined,
    );

    if (!hasAllowedField) {
      throw new Error(
        "Please provide at least one field to update",
      );
    }

    return true;
  }),
];

const courseSectionsValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),

  query("page")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .withMessage("Limit must be between 1 and 100"),
];

const sectionIdValidation = [
  param("sectionId")
    .isMongoId()
    .withMessage("Invalid section ID"),
];

module.exports = {
  createSectionValidation,
  updateSectionValidation,
  courseSectionsValidation,
  sectionIdValidation,
};