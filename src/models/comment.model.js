const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson is required for comment"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required for comment"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for comment"],
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ lesson: 1, parentComment: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
