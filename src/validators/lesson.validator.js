const { body, param, query } = require("express-validator");

const createLessonValidation = [
  param("sectionId").isMongoId().withMessage("Invalid section ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Lesson title is required")
    .bail()
    .isLength({
      min: 3,
      max: 150,
    })
    .withMessage("Lesson title must be between 3 and 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({
      max: 2000,
    })
    .withMessage("Lesson description cannot exceed 2000 characters"),

  body("order")
    .notEmpty()
    .withMessage("Lesson order is required")
    .bail()
    .isInt({
      min: 1,
    })
    .withMessage("Lesson order must be a positive integer"),

  body("isPreview")
    .optional()
    .isBoolean()
    .withMessage("isPreview must be true or false")
    .toBoolean(),
];

const updateLessonValidation = [
  param("lessonId").isMongoId().withMessage("Invalid lesson ID"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lesson title cannot be empty")
    .bail()
    .isLength({
      min: 3,
      max: 150,
    })
    .withMessage("Lesson title must be between 3 and 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({
      max: 2000,
    })
    .withMessage("Lesson description cannot exceed 2000 characters"),

  body("order")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage("Lesson order must be a positive integer"),

  body("isPreview")
    .optional()
    .isBoolean()
    .withMessage("isPreview must be true or false")
    .toBoolean(),

  body().custom((value, { req }) => {
    const hasBodyUpdate = ["title", "description", "order", "isPreview"].some(
      (field) => value[field] !== undefined,
    );

    if (!hasBodyUpdate && !req.file) {
      throw new Error("Please provide at least one field or video to update");
    }

    return true;
  }),
];

const sectionLessonsValidation = [
  param("sectionId").isMongoId().withMessage("Invalid section ID"),

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

const lessonIdValidation = [
  param("lessonId").isMongoId().withMessage("Invalid lesson ID"),
];

module.exports = {
  createLessonValidation,
  updateLessonValidation,
  sectionLessonsValidation,
  lessonIdValidation,
};
