const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Certificate user is required"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Certificate course is required"],
      index: true,
    },

    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: [true, "Certificate enrollment is required"],
      index: true,
    },

    verificationCode: {
      type: String,
      required: [true, "Verification code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedReason: {
      type: String,
      trim: true,
      maxlength: [500, "Revocation reason cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
