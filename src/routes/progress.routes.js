const express = require("express");

const progressController = require("../controllers/progress.controller");

const protect = require("../middleware/auth.middleware");

const validateRequest = require("../middleware/validation.middleware");

const {
  lessonProgressValidation,
  courseProgressValidation,
} = require("../validators/progress.validator");

const router = express.Router();

/*
 * All progress routes require authentication.
 */
router.use(protect);

router
  .route("/lessons/:lessonId/complete")
  .post(
    lessonProgressValidation,
    validateRequest,
    progressController.markLessonAsCompleted,
  )
  .delete(
    lessonProgressValidation,
    validateRequest,
    progressController.removeLessonCompletion,
  );

router.get(
  "/lessons/:lessonId/complete/status",
  lessonProgressValidation,
  validateRequest,
  progressController.getLessonCompletionStatus,
);

router.get(
  "/courses/:courseId/progress",
  courseProgressValidation,
  validateRequest,
  progressController.getMyCourseProgress,
);

module.exports = router;
