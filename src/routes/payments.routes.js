const express = require("express");

const paymentsController = require("../controllers/payments.controller");

const protect = require("../middleware/auth.middleware");
const verifyPaymobHmac = require("../middleware/paymobHmac.middleware");

const { checkoutValidator } = require("../validators/payment.validator");

const router = express.Router();

router.post("/webhook", verifyPaymobHmac, paymentsController.webhook);

router.use(protect);

router.get("/", paymentsController.getMyPayments);

router.post(
  "/checkout/:courseId",
  checkoutValidator,
  paymentsController.checkout,
);

module.exports = router;
