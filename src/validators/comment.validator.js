const { body, param } = require("express-validator");

const createCommentValidation = [
  body("content")
    .notEmpty()
    .withMessage("Comment content is required")
    .isString()
    .withMessage("Comment content must be a string")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comment cannot exceed 2000 characters"),
];

const commentIdValidation = [
  param("commentId")
    .isMongoId()
    .withMessage("Invalid comment ID format"),
];

module.exports = {
  createCommentValidation,
  commentIdValidation,
};
