const express = require("express");

const enrollmentsController = require("../controllers/enrollments.controller");

const protect = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validation.middleware");

const {
  courseEnrollmentValidation,
  enrollmentIdValidation,
  studentsQueryValidation,
} = require("../validators/enrollment.validator");

const router = express.Router();

/*
 * Every enrollment route requires authentication.
 */
router.use(protect);

/*
 * Current user routes.
 */
router.get(
  "/me",
  studentsQueryValidation,
  validateRequest,
  enrollmentsController.getMyEnrollments,
);

router.get(
  "/:courseId/status",
  courseEnrollmentValidation,
  validateRequest,
  enrollmentsController.getMyEnrollmentStatus,
);

router.post(
  "/:courseId",
  courseEnrollmentValidation,
  validateRequest,
  enrollmentsController.enrollInCourse,
);

router.delete(
  "/:courseId",
  courseEnrollmentValidation,
  validateRequest,
  enrollmentsController.cancelMyEnrollment,
);

/*
 * Instructor and admin routes.
 */
router.get(
  "/:courseId/students",
  courseEnrollmentValidation,
  studentsQueryValidation,
  validateRequest,
  enrollmentsController.getCourseStudents,
);

router.delete(
  "/:courseId/students/:enrollmentId",
  courseEnrollmentValidation,
  enrollmentIdValidation,
  validateRequest,
  enrollmentsController.removeStudentEnrollment,
);

module.exports = router;
