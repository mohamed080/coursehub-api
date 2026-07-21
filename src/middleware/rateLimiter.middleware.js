const rateLimit = require("express-rate-limit");

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour

  max: 5, // maximum 5 requests per hour

  message: {
    status: "fail",
    message: "Too many verification emails requested. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  resendVerificationLimiter,
};
