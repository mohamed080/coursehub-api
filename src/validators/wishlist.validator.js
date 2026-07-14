const { param, query } = require("express-validator");

const courseWishlistValidation = [
  param("courseId").isMongoId().withMessage("Invalid course ID"),
];

const wishlistQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search must be between 1 and 100 characters"),

  query("sort")
    .optional()
    .isIn(["newest", "oldest", "price-asc", "price-desc"])
    .withMessage("Invalid wishlist sort option"),
];

module.exports = {
  courseWishlistValidation,
  wishlistQueryValidation,
};
