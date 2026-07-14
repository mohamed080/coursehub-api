const { body, param, query } = require("express-validator");

const courseCertificateValidation = [
  param("courseId").isMongoId().withMessage("Invalid course ID"),
];

const certificateIdValidation = [
  param("certificateId").isMongoId().withMessage("Invalid certificate ID"),
];

const verificationCodeValidation = [
  param("verificationCode")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .bail()
    .matches(/^COURSEHUB-\d{4}-[A-F0-9]{12}$/i)
    .withMessage("Invalid verification code format"),
];

const certificatesQueryValidation = [
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

  query("isValid")
    .optional()
    .isBoolean()
    .withMessage("isValid must be true or false"),

  query("search")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 100,
    })
    .withMessage("Search must be between 1 and 100 characters"),
];

const revokeCertificateValidation = [
  param("certificateId").isMongoId().withMessage("Invalid certificate ID"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Revocation reason is required")
    .bail()
    .isLength({
      min: 5,
      max: 500,
    })
    .withMessage("Revocation reason must be between 5 and 500 characters"),
];

module.exports = {
  courseCertificateValidation,
  certificateIdValidation,
  verificationCodeValidation,
  certificatesQueryValidation,
  revokeCertificateValidation,
};
