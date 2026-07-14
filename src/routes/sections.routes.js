const express = require("express");

const sectionsController = require("../controllers/sections.controller");

const protect = require("../middleware/auth.middleware");

const optionalAuth = require("../middleware/optionalAuth.middleware");

const validateRequest = require("../middleware/validation.middleware");

const {
  createSectionValidation,
  updateSectionValidation,
  courseSectionsValidation,
  sectionIdValidation,
} = require("../validators/section.validator");

const router = express.Router();

/*
 * Course section routes.
 */
router
  .route("/courses/:courseId/sections")
  .get(
    optionalAuth,
    courseSectionsValidation,
    validateRequest,
    sectionsController.getCourseSections,
  )
  .post(
    protect,
    createSectionValidation,
    validateRequest,
    sectionsController.createSection,
  );

/*
 * Individual section routes.
 */
router
  .route("/sections/:sectionId")
  .get(
    optionalAuth,
    sectionIdValidation,
    validateRequest,
    sectionsController.getSectionById,
  )
  .patch(
    protect,
    updateSectionValidation,
    validateRequest,
    sectionsController.updateSection,
  )
  .delete(
    protect,
    sectionIdValidation,
    validateRequest,
    sectionsController.deleteSection,
  );

module.exports = router;
