const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "user_registration",
        "course_creation",
        "course_update",
        "course_status_change",
        "enrollment",
        "payment",
        "review_created",
        "review_deleted",
        "instructor_verified",
        "user_status_change",
      ],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

const logActivity = async ({ type, user, message, metadata = {} }) => {
  try {
    await Activity.create({
      type,
      user,
      message,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = {
  Activity,
  logActivity,
};
