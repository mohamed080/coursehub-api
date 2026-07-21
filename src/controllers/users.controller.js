const User = require("../models/user.model");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const cloudinary = require("../config/cloudinary");
const { uploadBufferToCloudinary } = require("../utils/uploadToCloudinary");
const getPagination = require("../helpers/pagination.helper");

const getAllUsers = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  if (req.query.search?.trim()) {
    const searchValue = req.query.search.trim();

    filter.$or = [
      {
        firstName: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: users.length,
    data: {
      users,
      pagination: {
        currentPage: page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const getUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});

const updateMyProfile = asyncWrapper(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "email"];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.email) {
    updates.email = updates.email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: updates.email,
      _id: { $ne: req.user._id },
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
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Profile updated successfully",
    data: {
      user: updatedUser,
    },
  });
});

const updateMyPassword = asyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(
        "Current password and new password are required",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  if (newPassword.length < 6) {
    return next(
      new AppError(
        "New password must be at least 6 characters",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return next(
      new AppError("Current password is incorrect", 401, httpStatusText.FAIL),
    );
  }

  /*
   * We use save() so the pre-save password
   * hashing middleware runs.
   */
  user.password = newPassword;

  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password updated successfully",
    data: null,
  });
});

const deactivateMyAccount = asyncWrapper(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    isActive: false,
    isDeleted: true,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Account deactivated successfully",
    data: null,
  });
});

const requestInstructorStatus = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  if (user.role === "instructor") {
    return next(
      new AppError("You are already an instructor", 400, httpStatusText.FAIL)
    );
  }

  if (user.instructorStatus === "pending") {
    return next(
      new AppError(
        "Your instructor request is already pending approval",
        400,
        httpStatusText.FAIL
      )
    );
  }

  user.instructorStatus = "pending";
  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Instructor request submitted successfully. Waiting for admin approval.",
    data: { user: user.toSafeObject() },
  });
});

const updateUserRole = asyncWrapper(async (req, res, next) => {
  const { role } = req.body;
  const allowedRoles = ["user", "instructor", "admin"];

  if (!allowedRoles.includes(role)) {
    return next(
      new AppError(
        "Role must be one of: user, instructor, admin",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { role },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User role updated successfully",
    data: {
      user,
    },
  });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User deleted successfully",
    data: null,
  });
});

const updateMyAvatar = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError(
        "Please upload an avatar image",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new AppError(
        "User not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  const uploadedImage = await uploadBufferToCloudinary(
    req.file.buffer,
    {
      folder: `coursehub/users/${user._id}`,
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "face",
        },
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    }
  );

  const oldPublicId = user.avatar?.publicId;

  user.avatar = {
    url: uploadedImage.url,
    publicId: uploadedImage.publicId,
  };

  await user.save();

  if (oldPublicId) {
    cloudinary.uploader.destroy(oldPublicId).catch((error) => {
      console.error("Failed to delete old avatar:", error.message);
    });
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Avatar updated successfully",
    data: {
      user,
    },
  });
});

const deleteMyAvatar = asyncWrapper(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(
        new AppError(
          "User not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    const oldPublicId = user.avatar?.publicId;

    user.avatar = {
      url:
        process.env.DEFAULT_USER_IMAGE ||
        "https://res.cloudinary.com/dqelqidlk/image/upload/v1783791514/default-avatar_bbpser.png",
      publicId: null,
    };

    await user.save();

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (error) {
        console.error(
          "Failed to delete avatar:",
          error.message
        );
      }
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Profile image removed successfully",
      data: {
        user,
      },
    });
  }
);

module.exports = {
  getAllUsers,
  getUserById,
  updateMyProfile,
  updateMyPassword,
  deactivateMyAccount,
  requestInstructorStatus,
  updateUserRole,
  deleteUser,
  updateMyAvatar,
  deleteMyAvatar,
};
