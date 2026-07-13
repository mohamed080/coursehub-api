const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Enrollment user is required"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Enrollment course is required"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "completed"],
        message: "Enrollment status must be active or completed",
      },
      default: "active",
      index: true,
    },

    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*
 * Prevent the same user from enrolling
 * in the same course more than once.
 */
enrollmentSchema.index(
  {
    user: 1,
    course: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);