const { body, param, query } = require("express-validator");

const createReviewValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .bail()
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Review comment is required")
    .bail()
    .isLength({
      min: 10,
      max: 1000,
    })
    .withMessage(
      "Review comment must be between 10 and 1000 characters",
    ),
];

const updateReviewValidation = [
  param("reviewId")
    .isMongoId()
    .withMessage("Invalid review ID"),

  body("rating")
    .optional()
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Review comment cannot be empty")
    .bail()
    .isLength({
      min: 10,
      max: 1000,
    })
    .withMessage(
      "Review comment must be between 10 and 1000 characters",
    ),

  body().custom((value) => {
    if (
      value.rating === undefined &&
      value.comment === undefined
    ) {
      throw new Error(
        "Please provide rating or comment to update",
      );
    }

    return true;
  }),
];

const reviewIdValidation = [
  param("reviewId")
    .isMongoId()
    .withMessage("Invalid review ID"),
];

const courseReviewsValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sort")
    .optional()
    .isIn([
      "newest",
      "oldest",
      "rating-high",
      "rating-low",
    ])
    .withMessage("Invalid review sort option"),
];

module.exports = {
  createReviewValidation,
  updateReviewValidation,
  reviewIdValidation,
  courseReviewsValidation,
};