const User = require("../models/user.model");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const generateToken = require("../utils/generateToken");

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return next(
      new AppError(
        "First name, last name, email and password are required",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return next(
      new AppError(
        "A user with this email already exists",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  /*
   * Password hashing happens automatically
   * inside userSchema.pre("save").
   */
  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Account created successfully",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Email and password are required", 400, httpStatusText.FAIL),
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  /*
   * Password has select: false, so we request it
   * explicitly only for the login operation.
   */
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  const isValidPassword = user && (await user.comparePassword(password));

  /*
   * Return the same message when the email or password
   * is incorrect. This prevents email enumeration.
   */
  if (!user || !isValidPassword) {
    return next(
      new AppError("Invalid email or password", 401, httpStatusText.FAIL),
    );
  }

  if (!user.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const token = generateToken(user._id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

const getCurrentUser = asyncWrapper(async (req, res) => {
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
};
