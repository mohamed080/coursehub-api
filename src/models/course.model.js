const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Course title must be at least 3 characters"],
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [2000, "Course description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price cannot be negative"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Course category is required"],
      index: true,
    },

    coverImage: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },
    },

    gallery: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => {
          return images.length <= 10;
        },
        message: "Course gallery cannot have more than 10 images",
      },
    },

    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be less than 0"],
      max: [5, "Average rating cannot exceed 5"],
      set: (value) => Math.round(value * 10) / 10,
    },

    ratingsCount: {
      type: Number,
      default: 0,
      min: [0, "Ratings count cannot be negative"],
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Invalid course status",
      },
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

courseSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Course", courseSchema);
