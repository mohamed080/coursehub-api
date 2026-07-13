const { param } = require("express-validator");

const courseGalleryParamsValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),
];

const galleryImageParamsValidation = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid course ID"),

  param("imageId")
    .isMongoId()
    .withMessage("Invalid gallery image ID"),
];

module.exports = {
  courseGalleryParamsValidation,
  galleryImageParamsValidation,
};