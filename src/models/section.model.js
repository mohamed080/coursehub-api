const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
      minlength: [3, "Section title must be at least 3 characters"],
      maxlength: [100, "Section title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Section description cannot exceed 500 characters"],
      default: "",
    },

    order: {
      type: Number,
      required: [true, "Section order is required"],
      min: [1, "Section order must be at least 1"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Section course is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sectionSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);
