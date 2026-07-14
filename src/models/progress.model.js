const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Progress user is required"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Progress course is required"],
      index: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Progress lesson is required"],
      index: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
