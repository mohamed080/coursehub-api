const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recently viewed user is required"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Recently viewed course is required"],
      index: true,
    },

    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Prevent duplicate records for the same user and course
recentlyViewedSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for sorting
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
