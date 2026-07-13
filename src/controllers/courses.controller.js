const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const { uploadBufferToCloudinary } = require("../utils/uploadToCloudinary");
const {
  checkCourseOwnership,
  validateGalleryLimit,
} = require("../helpers/course.helper");

const { deleteCloudinaryImage } = require("../helpers/cloudinary.helper");
const getPagination = require("../helpers/pagination.helper");
const { getActiveCategory } = require("../helpers/category.helper");
const populateCourse = require("../helpers/coursePopulate.helper");

const createCourse = asyncWrapper(async (req, res, next) => {
  const { title, description, price, category: categoryId, status } = req.body;

  const category = await getActiveCategory(categoryId);

  let coverImage = {
    url: null,
    publicId: null,
  };

  if (req.file) {
    coverImage = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `coursehub/courses/${req.user._id}/covers`,
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

  await populateCourse(course);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Course created successfully",
    data: {
      course,
    },
  });
});

const getAllCourses = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

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
      .populate("category", "name slug description")
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
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  await populateCourse(course);

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

  checkCourseOwnership(course, req.user);

  const allowedFields = ["title", "description", "price", "status"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      course[field] =
        field === "price" ? Number(req.body[field]) : req.body[field];
    }
  });

  if (req.body.category !== undefined) {
    const category = await getActiveCategory(req.body.category);

    course.category = category._id;
  }

  if (req.file) {
    const newCoverImage = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `coursehub/courses/${req.user._id}/covers`,
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

  await populateCourse(course);

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

  checkCourseOwnership(course, req.user);

  const galleryImages = course.gallery || [];

  const publicIds = [
    course.coverImage?.publicId,
    ...galleryImages.map((image) => image.publicId),
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

const addCourseGalleryImage = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  if (!req.files || req.files.length === 0) {
    return next(
      new AppError(
        "Please upload at least one image",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  validateGalleryLimit(course, req.files.length);

  let uploadedImages = [];

  try {
    uploadedImages = await Promise.all(
      req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder: `coursehub/courses/${course._id}/gallery`,
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
        }),
      ),
    );

    course.gallery.push(...uploadedImages);

    await course.save();
  } catch (error) {
    await Promise.all(
      uploadedImages.map((image) => deleteCloudinaryImage(image.publicId)),
    );
    throw error;
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course gallery images added successfully",
    results: uploadedImages.length,
    data: {
      gallery: course.gallery,
    },
  });
});

const deleteCourseGalleryImage = asyncWrapper(async (req, res, next) => {
  const { courseId, imageId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  const galleryImage = course.gallery.id(imageId);

  if (!galleryImage) {
    return next(
      new AppError("Gallery image not found", 404, httpStatusText.FAIL),
    );
  }

  const publicId = galleryImage.publicId;

  galleryImage.deleteOne();

  await course.save();

  await deleteCloudinaryImage(publicId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Gallery image deleted successfully",
    data: {
      gallery: course.gallery,
    },
  });
});

const clearCourseGallery = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  if (course.gallery.length === 0) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Course gallery is already empty",
      data: {
        gallery: [],
      },
    });
  }

  const publicIds = course.gallery
    .map((image) => image.publicId)
    .filter(Boolean);

  course.gallery = [];

  await course.save();

  await Promise.all(
    publicIds.map((publicId) => deleteCloudinaryImage(publicId)),
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course gallery cleared successfully",
    data: {
      gallery: [],
    },
  });
});

const getCourseGallery = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select(
    "title coverImage gallery",
  );

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: course.gallery.length,
    data: {
      courseId: course._id,
      title: course.title,
      coverImage: course.coverImage,
      gallery: course.gallery,
    },
  });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateMyCourse,
  deleteMyCourse,

  getCourseGallery,
  addCourseGalleryImage,
  deleteCourseGalleryImage,
  clearCourseGallery,
};
