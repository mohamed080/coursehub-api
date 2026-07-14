const express = require("express");

const lessonsController = require("../controllers/lessons.controller");

const protect = require("../middleware/auth.middleware");

const optionalAuth = require("../middleware/optionalAuth.middleware");

const uploadVideo = require("../middleware/uploadVideo.middleware");

const validateRequest = require("../middleware/validation.middleware");

const {
  createLessonValidation,
  updateLessonValidation,
  sectionLessonsValidation,
  lessonIdValidation,
} = require("../validators/lesson.validator");

const router = express.Router();

router
  .route("/sections/:sectionId/lessons")
  .get(
    optionalAuth,
    sectionLessonsValidation,
    validateRequest,
    lessonsController.getSectionLessons,
  )
  .post(
    protect,
    uploadVideo.single("video"),
    createLessonValidation,
    validateRequest,
    lessonsController.createLesson,
  );

router
  .route("/lessons/:lessonId")
  .get(
    optionalAuth,
    lessonIdValidation,
    validateRequest,
    lessonsController.getLessonById,
  )
  .patch(
    protect,
    uploadVideo.single("video"),
    updateLessonValidation,
    validateRequest,
    lessonsController.updateLesson,
  )
  .delete(
    protect,
    lessonIdValidation,
    validateRequest,
    lessonsController.deleteLesson,
  );

module.exports = router;
