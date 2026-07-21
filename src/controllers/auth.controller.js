const User = require("../models/user.model");
const crypto = require("crypto");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const generateToken = require("../utils/generateToken");
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
        {email: user.email,
          needVerification: true
        },
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

  const token = generateToken(user._id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password reset successfully",
    data: {
      user: user.toSafeObject(),
      token,
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
  
  if (user.emailVerified) {
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

module.exports = {
  forgotPassword,
  register,
  login,
  getCurrentUser,
  resetPassword,
  verifyEmail,
  resendVerification,
};
