const express = require("express");

const certificatesController = require("../controllers/certificates.controller");

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/authorize.middleware");

const validateRequest = require("../middleware/validation.middleware");

const {
  courseCertificateValidation,
  certificateIdValidation,
  verificationCodeValidation,
  certificatesQueryValidation,
  revokeCertificateValidation,
} = require("../validators/certificate.validator");

const router = express.Router();

/*
 * Public certificate verification.
 *
 * This route must come before /:certificateId
 * so "verify" is not interpreted as an ID.
 */
router.get(
  "/verify/:verificationCode",
  verificationCodeValidation,
  validateRequest,
  certificatesController.verifyCertificate,
);

/*
 * Every route below requires authentication.
 */
router.use(protect);

/*
 * Current user routes.
 */
router.get(
  "/me",
  certificatesQueryValidation,
  validateRequest,
  certificatesController.getMyCertificates,
);

router.post(
  "/courses/:courseId",
  courseCertificateValidation,
  validateRequest,
  certificatesController.generateCertificate,
);

/*
 * Admin list route must come before /:certificateId.
 */
router.get(
  "/",
  authorize("admin"),
  certificatesQueryValidation,
  validateRequest,
  certificatesController.getAllCertificates,
);

router.patch(
  "/:certificateId/revoke",
  authorize("admin"),
  revokeCertificateValidation,
  validateRequest,
  certificatesController.revokeCertificate,
);

router.patch(
  "/:certificateId/restore",
  authorize("admin"),
  certificateIdValidation,
  validateRequest,
  certificatesController.restoreCertificate,
);

router.get(
  "/:certificateId",
  certificateIdValidation,
  validateRequest,
  certificatesController.getCertificateById,
);

module.exports = router;
