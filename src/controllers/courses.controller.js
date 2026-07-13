const Course = require("../models/course.model");
const Category = require("../models/category.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const { uploadBufferToCloudinary } = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary image ${publicId}:`,
      error.message,
    );
  }
};

const createCourse = asyncWrapper(async (req, res, next) => {
  const { title, description, price, category: categoryId, status } = req.body;

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    return next(new AppError("Category not found", 404, httpStatusText.FAIL));
  }

  if (!title || !description || price === undefined) {
    return next(
      new AppError(
        "Title, description and price are required",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  let coverImage = {
    url: null,
    publicId: null,
  };

  if (req.file) {
    coverImage = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `company-api/courses/${req.user._id}/covers`,
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
    category: category._id,
    coverImage,
    instructor: req.user._id,
    status: status || "draft",
  });

  await course.populate([
    {
      path: "instructor",
      select: "firstName lastName email avatar",
    },
    {
      path: "category",
      select: "name slug description",
    },
  ]);

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

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.minPrice !== undefined) {
    filter.price = {
      ...filter.price,
      $gte: Number(req.query.minPrice),
    };
  }

  if (req.query.maxPrice !== undefined) {
    filter.price = {
      ...filter.price,
      $lte: Number(req.query.maxPrice),
    };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
  };

  const sort = sortOptions[req.query.sort] || sortOptions.newest;

  const [courses, totalCourses] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName avatar")
      .sort(sort)
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

const getCourseById = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId)
    .populate("instructor", "firstName lastName email avatar")
    .populate("category", "name slug description");

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course,
    },
  });
});

const updateMyCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const isOwner = course.instructor.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return next(
      new AppError("You cannot update this course", 403, httpStatusText.FAIL),
    );
  }

  const allowedFields = ["title", "description", "price", "status"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      course[field] =
        field === "price" ? Number(req.body[field]) : req.body[field];
    }
  });

  if (req.body.category !== undefined) {
    const category = await Category.findOne({
      _id: req.body.category,
      isActive: true,
    });

    if (!category) {
      return next(
        new AppError(
          "Category not found or inactive",
          400,
          httpStatusText.FAIL,
        ),
      );
    }

    course.category = category._id;
  }

  if (req.file) {
    const newCoverImage = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `company-api/courses/${req.user._id}/covers`,
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

    const oldPublicId = course.coverImage?.publicId;

    course.coverImage = newCoverImage;

    await course.save();

    await deleteCloudinaryImage(oldPublicId);
  } else {
    await course.save();
  }

  await course.populate([
    {
      path: "instructor",
      select: "firstName lastName email avatar",
    },
    {
      path: "category",
      select: "name slug description",
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course updated successfully",
    data: {
      course,
    },
  });
});

const deleteMyCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const isOwner = course.instructor.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return next(
      new AppError("You cannot delete this course", 403, httpStatusText.FAIL),
    );
  }

  const publicIds = [
    course.coverImage?.publicId,
    ...course.gallery.map((image) => image.publicId),
  ].filter(Boolean);

  await course.deleteOne();

  await Promise.all(
    publicIds.map((publicId) => deleteCloudinaryImage(publicId)),
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course deleted successfully",
    data: null,
  });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateMyCourse,
  deleteMyCourse,
};
