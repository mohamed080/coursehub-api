const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const { paymob, authenticate } = require("../utils/paymob");

const {
  validateCoupon,
  calculateDiscount,
  markCouponUsed,
} = require("../helpers/coupon.helper");

const {
  createPendingPayment,
  updatePaymentById,
  getPaymentByOrderId,
} = require("../helpers/payment.helper");

const checkout = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  let finalAmount = course.price;

  let discount = 0;

  let coupon = null;

  if (req.body.coupon) {
    coupon = await validateCoupon({
      code: req.body.coupon,

      userId: req.user._id,

      amount: course.price,
    });

    const result = calculateDiscount(coupon, course.price);

    discount = result.discount;

    finalAmount = result.finalAmount;
  }

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  if (course.status !== "published") {
    return next(
      new AppError("Course is not available", 400, httpStatusText.FAIL),
    );
  }

  const alreadyEnrolled = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (alreadyEnrolled) {
    return next(
      new AppError(
        "You are already enrolled in this course",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const payment = await createPendingPayment({
    user: req.user._id,
    course: course._id,
    amount: course.price,

    finalAmount,

    discount,

    coupon: coupon?._id || null,
  });

  try {
    const amountCents = Math.round(finalAmount * 100);

    const authToken = await authenticate();

    const { data: order } = await paymob.post("/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: payment._id.toString(),
      items: [
        {
          name: course.title,
          amount_cents: amountCents,
          quantity: 1,
        },
      ],
    });

    const { data: paymentKey } = await paymob.post("/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,

      order_id: order.id,

      billing_data: {
        apartment: "NA",
        email: req.user.email,
        floor: "NA",
        first_name: req.user.firstName,
        street: "NA",
        building: "NA",
        phone_number: req.user.phone || "01000000000",
        shipping_method: "NA",
        postal_code: "00000",
        city: "Cairo",
        country: "EG",
        last_name: req.user.lastName,
        state: "Cairo",
      },

      currency: "EGP",

      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    });

    const updatedPayment = await updatePaymentById(payment._id, {
      orderId: order.id.toString(),
      paymentKey: paymentKey.token,
    });

    const paymentUrl =
      `${process.env.PAYMOB_BASE_URL}/api/acceptance/iframes/` +
      `${process.env.PAYMOB_IFRAME_ID}` +
      `?payment_token=${paymentKey.token}`;

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Checkout created successfully",
      data: {
        payment: updatedPayment,
        paymentUrl,
      },
    });
  } catch (error) {
    console.error("Paymob Error:", error.response?.data || error.message);

    return next(
      new AppError(
        "Failed to create Paymob checkout session",
        500,
        httpStatusText.ERROR,
      ),
    );
  }
});

const getMyPayments = asyncWrapper(async (req, res) => {
  const payments = await Payment.find({
    user: req.user._id,
  })
    .populate("course", "title coverImage price")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: payments.length,
    data: {
      payments,
    },
  });
});

const webhook = asyncWrapper(async (req, res) => {
  const transaction = req.body.obj;

  if (!transaction) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid payload",
    });
  }

  const payment = await getPaymentByOrderId(transaction.order.id.toString());

  if (!payment) {
    return res.status(404).json({
      status: "fail",
      message: "Payment not found",
    });
  }

  // Save transaction id
  payment.transactionId = transaction.id.toString();

  if (transaction.success) {
    payment.status = "paid";
    payment.paidAt = new Date();

    if (payment.coupon) {
      await markCouponUsed(payment.coupon, payment.user);
    }

    await Enrollment.findOneAndUpdate(
      {
        user: payment.user,
        course: payment.course,
      },
      {},
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } else {
    payment.status = "failed";
  }

  await payment.save();

  res.status(200).json({
    status: "success",
    message: "Webhook received",
  });
});

module.exports = {
  checkout,
  getMyPayments,
  webhook,
};
