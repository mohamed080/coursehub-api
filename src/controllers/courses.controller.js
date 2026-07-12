const Course = require("../models/course.model");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const {uploadBufferToCloudinary} = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");

const createCourse = asyncWrapper(async (req, res, next) => {
  const { title, description, price } = req.body;

  if (!title || !description || price === undefined) {
    return next(
      new AppError(
        "Title, description and price are required",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  let uploadedImage = {
    url: null,
    publicId: null,
  };

  if (req.file) {
    uploadedImage = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `company-api/courses/${req.user._id}`,
      transformation: [
        {
          width: 1200,
          height: 675,
          crop: "fill",
        },
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });
  }

  const course = await Course.create({
    title,
    description,
    price: Number(price),
    image: uploadedImage,
    instructor: req.user._id,
  });

  await course.populate("instructor", "firstName lastName email avatar");

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Course created successfully",
    data: {
      course,
    },
  });
});

const getAllCourses = asyncWrapper(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;

  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.search?.trim()) {
    filter.$text = {
      $search: req.query.search.trim(),
    };
  }

  if (req.query.instructor) {
    filter.instructor = req.query.instructor;
  }

  if (req.query.isPublished !== undefined) {
    filter.isPublished = req.query.isPublished === "true";
  }

  const [courses, totalCourses] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Course.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCourses / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: courses.length,
    data: {
      courses,
      pagination: {
        currentPage: page,
        limit,
        totalCourses,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const getCourseById = asyncWrapper(
  async (req, res, next) => {
    const course = await Course.findById(
      req.params.courseId
    ).populate(
      "instructor",
      "firstName lastName email avatar"
    );

    if (!course) {
      return next(
        new AppError(
          "Course not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        course,
      },
    });
  }
);

const updateMyCourse = asyncWrapper(
  async (req, res, next) => {
    const course = await Course.findById(
      req.params.courseId
    );

    if (!course) {
      return next(
        new AppError(
          "Course not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    const isOwner =
      course.instructor.toString() ===
      req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return next(
        new AppError(
          "You cannot update this course",
          403,
          httpStatusText.FAIL
        )
      );
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "isPublished",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    if (req.file) {
      const newImage = await uploadBufferToCloudinary(
        req.file.buffer,
        {
          folder: `company-api/courses/${req.user._id}`,
          transformation: [
            {
              width: 1200,
              height: 675,
              crop: "fill",
            },
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        }
      );

      const oldPublicId = course.image?.publicId;

      course.image = newImage;

      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (error) {
          console.error(
            "Failed to delete old course image:",
            error.message
          );
        }
      }
    }

    await course.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Course updated successfully",
      data: {
        course,
      },
    });
  }
);

const deleteMyCourse = asyncWrapper(
  async (req, res, next) => {
    const course = await Course.findById(
      req.params.courseId
    );

    if (!course) {
      return next(
        new AppError(
          "Course not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    const isOwner =
      course.instructor.toString() ===
      req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return next(
        new AppError(
          "You cannot delete this course",
          403,
          httpStatusText.FAIL
        )
      );
    }

    await course.deleteOne();

    if (course.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(
          course.image.publicId
        );
      } catch (error) {
        console.error(
          "Failed to delete course image:",
          error.message
        );
      }
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Course deleted successfully",
      data: null,
    });
  }
);

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateMyCourse,
  deleteMyCourse,
};