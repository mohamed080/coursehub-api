const express = require("express");

const adminController = require("../controllers/admin.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

/*
 * All admin dashboard & management routes require authentication and the admin role.
 */
router.use(protect, authorize("admin"));

// Analytics & Dashboard
router.get("/dashboard", adminController.getAdminDashboard);
router.get("/revenue", adminController.getAdminRevenueChart);
router.get("/enrollments", adminController.getAdminEnrollmentChart);
router.get("/users/growth", adminController.getAdminUserGrowthChart);
router.get("/top-courses", adminController.getAdminTopCourses);
router.get("/top-instructors", adminController.getAdminTopInstructors);

// User Management
router.get("/users", adminController.getAdminUsers);
router.get("/users/:id", adminController.getAdminUserById);
router.patch("/users/:id/status", adminController.updateAdminUserStatus);
router.delete("/users/:id", adminController.deleteAdminUser);

// Course Management
router.get("/courses", adminController.getAdminCourses);
router.get("/courses/:id", adminController.getAdminCourseById);
router.patch("/courses/:id/status", adminController.updateAdminCourseStatus);
router.delete("/courses/:id", adminController.deleteAdminCourse);

// Instructor Management
router.get("/instructors", adminController.getAdminInstructors);
router.patch("/instructors/:id/verify", adminController.verifyAdminInstructor);
router.get("/instructors/requests", adminController.getInstructorRequests);
router.patch("/instructors/:id/approve", adminController.approveInstructorRequest);
router.patch("/instructors/:id/reject", adminController.rejectInstructorRequest);

// Payment Management
router.get("/payments", adminController.getAdminPayments);
router.get("/payments/:id", adminController.getAdminPaymentById);
router.patch("/payments/:id/refund", adminController.refundAdminPayment);

// Reviews Moderation
router.get("/reviews", adminController.getAdminReviews);
router.delete("/reviews/:id", adminController.deleteAdminReview);

// Activity Feed
router.get("/activity", adminController.getAdminActivity);

// Export System
router.get("/export/users", adminController.exportAdminUsers);
router.get("/export/revenue", adminController.exportAdminRevenue);
router.get("/export/courses", adminController.exportAdminCourses);

module.exports = router;
