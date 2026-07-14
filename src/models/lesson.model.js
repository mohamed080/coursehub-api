const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Lesson video URL is required"],
    },

    publicId: {
      type: String,
      required: [true, "Lesson video public ID is required"],
    },

    duration: {
      type: Number,
      default: null,
      min: [0, "Video duration cannot be negative"],
    },

    format: {
      type: String,
      default: null,
    },

    bytes: {
      type: Number,
      default: null,
      min: [0, "Video size cannot be negative"],
    },
  },
  {
    _id: false,
  },
);

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Lesson title must be at least 3 characters"],
      maxlength: [150, "Lesson title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Lesson description cannot exceed 2000 characters"],
      default: "",
    },

    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: [1, "Lesson order must be at least 1"],
    },

    video: {
      type: videoSchema,
      required: [true, "Lesson video is required"],
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Lesson section is required"],
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Lesson course is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*
 * The same section cannot contain two lessons
 * with the same order.
 */
lessonSchema.index({ section: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", lessonSchema);
