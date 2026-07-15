const Coupon = require("../models/coupon.model");

const getCouponByCode = async (code) => {
  return Coupon.findOne({
    code: code.toUpperCase(),
  });
};

const validateCoupon = async ({ code, userId, amount }) => {
  const coupon = await getCouponByCode(code);

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (!coupon.active) {
    throw new Error("Coupon is inactive");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("Coupon expired");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  const alreadyUsed = coupon.usedBy.includes(userId);

  if (alreadyUsed) {
    throw new Error("You already used this coupon");
  }

  if (amount < coupon.minimumAmount) {
    throw new Error("Minimum amount not reached");
  }

  return coupon;
};

const calculateDiscount = (coupon, amount) => {
  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (amount * coupon.value) / 100;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  if (coupon.type === "fixed") {
    discount = coupon.value;
  }

  if (discount > amount) {
    discount = amount;
  }

  return {
    discount,
    finalAmount: amount - discount,
  };
};

const markCouponUsed = async (couponId, userId) => {
  await Coupon.findByIdAndUpdate(couponId, {
    $inc: {
      usedCount: 1,
    },

    $addToSet: {
      usedBy: userId,
    },
  });
};

module.exports = {
  validateCoupon,
  calculateDiscount,
  markCouponUsed,
};
