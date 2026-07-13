const express = require("express");

const coursesController = require("../controllers/courses.controller");
const protect = require("../middleware/auth.middleware");
const uploadImage = require("../middleware/upload.middleware");
const validateRequest = require("../middleware/validation.middleware");
const {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
} = require("../validators/course.validator");

const router = express.Router();

router
  .route("/")
  .get(coursesController.getAllCourses)
  .post(
    protect,
    uploadImage.single("coverImage"),
    createCourseValidation,
    validateRequest,
    coursesController.createCourse,
  );

router
  .route("/:courseId")
  .get(courseIdValidation, validateRequest, coursesController.getCourseById)
  .patch(
    protect,
    uploadImage.single("coverImage"),
    courseIdValidation,
    updateCourseValidation,
    validateRequest,
    coursesController.updateMyCourse,
  )
  .delete(
    protect,
    courseIdValidation,
    validateRequest,
    coursesController.deleteMyCourse,
  );

module.exports = router;
