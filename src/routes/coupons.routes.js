const express = require("express");

const couponsController = require("../controllers/coupons.controller");

const protect = require("../middleware/auth.middleware");

const restrictTo = require("../middleware/role.middleware");

const { createCouponValidator } = require("../validators/coupon.validator");

const router = express.Router();

// Admin only

router.use(protect);

router.post(
  "/",
  restrictTo("admin"),
  createCouponValidator,
  couponsController.createCoupon,
);

router.get("/", restrictTo("admin"), couponsController.getCoupons);

router.patch("/:id", restrictTo("admin"), couponsController.updateCoupon);

router.delete("/:id", restrictTo("admin"), couponsController.deleteCoupon);

// User

router.post("/validate", couponsController.checkCoupon);

module.exports = router;
