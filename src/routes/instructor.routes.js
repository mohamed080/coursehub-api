const express = require("express");

const instructorController = require("../controllers/instructor.controller");

const protect = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.use(role("instructor", "admin"));

router.get("/dashboard", instructorController.getDashboard);
router.get("/courses", instructorController.getMyCourses);
router.get("/revenue", instructorController.getRevenueAnalytics);
router.get("/enrollments", instructorController.getEnrollmentAnalytics);
router.get("/top-courses", instructorController.getTopCourses);
router.get(
  "/courses/:courseId/analytics",
  instructorController.getCourseAnalytics,
);

module.exports = router;
