const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const asyncWrapper = require("./asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const protect = asyncWrapper(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(
      new AppError("Authentication required", 401, httpStatusText.FAIL),
    );
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return next(
      new AppError("Authentication token is missing", 401, httpStatusText.FAIL),
    );
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Authentication token has expired. Please refresh your token.",
          401,
          httpStatusText.FAIL,
        ),
      );
    }

    return next(
      new AppError("Invalid authentication token", 401, httpStatusText.FAIL),
    );
  }

  // NEW: Verify token type is "access"
  if (decodedToken.type !== "access") {
    return next(
      new AppError("Invalid token type", 401, httpStatusText.FAIL),
    );
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    return next(
      new AppError(
        "The user associated with this token no longer exists",
        401,
        httpStatusText.FAIL,
      ),
    );
  }

  if (!user.isActive) {
    return next(
      new AppError(
        "This account has been deactivated",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  req.user = user;

  next();
});

module.exports = protect;
