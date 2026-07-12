const express = require("express");

const coursesController = require("../controllers/courses.controller");
const protect = require("../middleware/auth.middleware");
const uploadImage = require("../middleware/upload.middleware");
const validateRequest = require("../middleware/validation.middleware");
const { createCourseValidation } = require("../validators/course.validator");

const router = express.Router();

router
  .route("/")
  .get(coursesController.getAllCourses)
  .post(
    protect,
    uploadImage.single("image"),
    createCourseValidation,
    validateRequest,
    coursesController.createCourse
  );

router
  .route("/:courseId")
  .get(coursesController.getCourseById)
  .patch(
    protect,
    uploadImage.single("image"),
    coursesController.updateMyCourse
  )
  .delete(
    protect,
    coursesController.deleteMyCourse
  );

module.exports = router;