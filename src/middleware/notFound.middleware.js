const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const notFound = (req, res, next) => {
  next(
    new AppError(
      `Route ${req.originalUrl} not found`,
      404,
      httpStatusText.FAIL,
    ),
  );
};

module.exports = notFound;
