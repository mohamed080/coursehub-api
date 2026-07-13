const express = require("express");

const categoriesController = require("../controllers/categories.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validateRequest = require("../middleware/validation.middleware");

const {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
} = require("../validators/category.validator");

const router = express.Router();

/**
 * Public routes
 */
router.get("/", categoriesController.getAllCategories);

router.get("/:identifier", categoriesController.getCategory);

/**
 * Admin routes
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  createCategoryValidation,
  validateRequest,
  categoriesController.createCategory,
);

router.patch(
  "/:categoryId",
  protect,
  authorize("admin"),
  categoryIdValidation,
  updateCategoryValidation,
  validateRequest,
  categoriesController.updateCategory,
);

router.delete(
  "/:categoryId",
  protect,
  authorize("admin"),
  categoryIdValidation,
  validateRequest,
  categoriesController.deleteCategory,
);

module.exports = router;
