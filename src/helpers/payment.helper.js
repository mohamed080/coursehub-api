const Payment = require("../models/payment.model");

const createPendingPayment = async ({ user, course, amount }) => {
  return Payment.create({
    user,
    course,
    amount,
    status: "pending",
    provider: "paymob",
    currency: "EGP",
  });
};

const updatePaymentById = async (paymentId, data) => {
  return Payment.findByIdAndUpdate(paymentId, data, {
    new: true,
  });
};

const getPaymentByOrderId = (orderId) => {
  return Payment.findOne({
    orderId,
  });
};

module.exports = {
  createPendingPayment,
  updatePaymentById,
  getPaymentByOrderId,
};
