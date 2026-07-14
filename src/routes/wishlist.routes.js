const express = require("express");

const wishlistController = require("../controllers/wishlist.controller");

const protect = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validation.middleware");

const {
  courseWishlistValidation,
  wishlistQueryValidation,
} = require("../validators/wishlist.validator");

const router = express.Router();

router.use(protect);

router
  .route("/me")
  .get(
    wishlistQueryValidation,
    validateRequest,
    wishlistController.getMyWishlist,
  )
  .delete(wishlistController.clearMyWishlist);

router.get(
  "/:courseId/status",
  courseWishlistValidation,
  validateRequest,
  wishlistController.getWishlistCourseStatus,
);

router
  .route("/:courseId")
  .post(
    courseWishlistValidation,
    validateRequest,
    wishlistController.addCourseToWishlist,
  )
  .delete(
    courseWishlistValidation,
    validateRequest,
    wishlistController.removeCourseFromWishlist,
  );

module.exports = router;
