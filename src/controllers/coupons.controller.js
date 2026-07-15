const Coupon = require("../models/coupon.model");

const asyncWrapper = require("../middleware/asyncWrapper");

const AppError = require("../utils/appError");

const httpStatusText = require("../utils/httpStatusText");

const {
  validateCoupon,
  calculateDiscount,
} = require("../helpers/coupon.helper");

const createCoupon = asyncWrapper(async (req, res) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,

    message: "Coupon created successfully",

    data: {
      coupon,
    },
  });
});

const getCoupons = asyncWrapper(async (req, res) => {
  const coupons = await Coupon.find();

  res.status(200).json({
    status: httpStatusText.SUCCESS,

    results: coupons.length,

    data: {
      coupons,
    },
  });
});

const updateCoupon = asyncWrapper(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!coupon) {
    return next(new AppError("Coupon not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,

    data: {
      coupon,
    },
  });
});

const deleteCoupon = asyncWrapper(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError("Coupon not found", 404, httpStatusText.FAIL));
  }

  res.status(204).json();
});

const checkCoupon = asyncWrapper(async (req, res) => {
  const { code, amount } = req.body;

  const coupon = await validateCoupon({
    code,

    userId: req.user._id,

    amount,
  });

  const result = calculateDiscount(coupon, amount);

  res.status(200).json({
    status: httpStatusText.SUCCESS,

    data: {
      coupon,
      ...result,
    },
  });
});

module.exports = {
  createCoupon,

  getCoupons,

  updateCoupon,

  deleteCoupon,

  checkCoupon,
};
