const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [
        3,
        "Course title must be at least 3 characters",
      ],
      maxlength: [
        100,
        "Course title cannot exceed 100 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [
        2000,
        "Course description cannot exceed 2000 characters",
      ],
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price cannot be negative"],
    },

    image: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

courseSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Course", courseSchema);