const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/tokenHelper");
const {
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
} = require("../services/email.service");

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
    role: "user",
  });

  const verificationToken = user.createEmailVerificationToken();
  await user.save({
    validateBeforeSave: false,
  });

  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail({
      user,
      verificationUrl,
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    return next(new AppError("Failed to send verification email", 500));
  }

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Account created successfully. Please verify your email address.",
    data: {
      user: user.toSafeObject(),
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

  if (!user.isEmailVerified) {
    return next(
      new AppError(
        "Please verify your email address before logging in",
        403,
        httpStatusText.FAIL,
        { email: user.email, needVerification: true },
      ),
    );
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Hash and save refresh token in database
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  await user.save({
    validateBeforeSave: false,
  });

  // Set refresh token in HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
      accessToken,
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

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400, httpStatusText.FAIL));
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "If an account exists, a password reset email has been sent",
      data: null,
    });
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  try {
    await sendResetPasswordEmail({
      user,
      resetUrl,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        "Failed to send password reset email",
        500,
        httpStatusText.ERROR,
      ),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "If an account exists, a password reset email has been sent",
    data: null,
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(
      new AppError(
        "Password must be at least 6 characters",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    return next(
      new AppError(
        "Password reset token is invalid or expired",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Hash and save refresh token in database
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  await user.save({
    validateBeforeSave: false,
  });

  // Set refresh token in HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password reset successfully",
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

const verifyEmail = asyncWrapper(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: {
      $gt: Date.now(),
    },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return next(
      new AppError(
        "Invalid or expired verification token",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  if (user.isEmailVerified) {
    return next(
      new AppError("Email is already verified", 400, httpStatusText.FAIL),
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  // Send welcome email after verification
  await sendWelcomeEmail(user);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Email verified successfully",
    data: {
      user: user.toSafeObject(),
    },
  });
});

const resendVerification = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400, httpStatusText.FAIL));
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    // Prevent email enumeration
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "If an account exists, a verification email has been sent",
      data: null,
    });
  }

  if (user.isEmailVerified) {
    return next(
      new AppError("Email is already verified", 400, httpStatusText.FAIL),
    );
  }

  // Create new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({
    validateBeforeSave: false,
  });

  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail({
      user,
      verificationUrl,
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        "Failed to send verification email",
        500,
        httpStatusText.ERROR,
      ),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "If an account exists, a verification email has been sent",
    data: null,
  });
});

const refreshAccessToken = asyncWrapper(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(
      new AppError("Refresh token not found", 401, httpStatusText.FAIL),
    );
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return next(
      new AppError("Invalid or expired refresh token", 401, httpStatusText.FAIL),
    );
  }

  if (decodedToken.type !== "refresh") {
    return next(
      new AppError("Invalid token type", 401, httpStatusText.FAIL),
    );
  }

  // Fetch user with refresh token fields
  const user = await User.findById(decodedToken.userId).select(
    "+refreshToken +refreshTokenExpires"
  );

  if (!user || !user.isActive) {
    clearRefreshTokenCookie(res);
    return next(
      new AppError(
        "User not found or account is deactivated",
        401,
        httpStatusText.FAIL
      )
    );
  }

  if (!user.isEmailVerified) {
    return next(
      new AppError(
        "Please verify your email before accessing resources",
        403,
        httpStatusText.FAIL
      )
    );
  }

  // Hash the received refresh token and compare with stored hash
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  if (
    user.refreshToken !== hashedRefreshToken ||
    user.refreshTokenExpires < Date.now()
  ) {
    clearRefreshTokenCookie(res);
    return next(
      new AppError("Invalid or expired refresh token", 401, httpStatusText.FAIL),
    );
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Update refresh token in database
  const newHashedRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = newHashedRefreshToken;
  user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await user.save({
    validateBeforeSave: false,
  });

  // Set new refresh token in cookie
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Access token refreshed successfully",
    data: {
      accessToken: newAccessToken,
    },
  });
});

const logout = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await User.findOneAndUpdate(
      {
        refreshToken: hashedRefreshToken,
      },
      {
        refreshToken: undefined,
        refreshTokenExpires: undefined,
      },
    );
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Logged out successfully",
    data: null,
  });
});

module.exports = {
  forgotPassword,
  register,
  login,
  getCurrentUser,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshAccessToken,
  logout,
};
