const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required", 401, httpStatusText.FAIL),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          httpStatusText.FAIL,
        ),
      );
    }

    next();
  };
};

module.exports = authorize;
