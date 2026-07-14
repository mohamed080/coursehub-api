const express = require("express");

const reviewsController = require("../controllers/reviews.controller");

const protect = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validation.middleware");

const {
  createReviewValidation,
  updateReviewValidation,
  reviewIdValidation,
  courseReviewsValidation,
} = require("../validators/review.validator");

const router = express.Router();

/*
 * Public route.
 */
router.get(
  "/courses/:courseId",
  courseReviewsValidation,
  validateRequest,
  reviewsController.getCourseReviews,
);

/*
 * Every route below requires authentication.
 */
router.use(protect);

router.get("/me", reviewsController.getMyReviews);

router.get(
  "/courses/:courseId/me",
  courseReviewsValidation,
  validateRequest,
  reviewsController.getMyCourseReview,
);

router.post(
  "/courses/:courseId",
  createReviewValidation,
  validateRequest,
  reviewsController.createReview,
);

router
  .route("/:reviewId")
  .patch(
    updateReviewValidation,
    validateRequest,
    reviewsController.updateMyReview,
  )
  .delete(reviewIdValidation, validateRequest, reviewsController.deleteReview);

module.exports = router;
