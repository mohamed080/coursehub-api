const httpStatusText = require("../utils/httpStatusText");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let statusText = err.statusText || httpStatusText.ERROR;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    statusText = httpStatusText.FAIL;
    message = `Invalid ${err.path}`;
  }

  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";

    statusCode = 409;
    statusText = httpStatusText.FAIL;
    message = `${duplicatedField} already exists`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    statusText = httpStatusText.FAIL;

    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(", ");
  }

  res.status(statusCode).json({
    status: statusText,
    message,
    code: statusCode,
    data: err.data || null,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = globalErrorHandler;
