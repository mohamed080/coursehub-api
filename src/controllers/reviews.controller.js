const Review = require("../models/review.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getPagination = require("../helpers/pagination.helper");

const { recalculateCourseRating } = require("../helpers/review.helper");

// access Enrolled user
const createReview = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const isInstructor = course.instructor.toString() === req.user._id.toString();

  if (isInstructor) {
    return next(
      new AppError(
        "You cannot review your own course",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
    status: {
      $in: ["active", "completed"],
    },
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You must be enrolled in the course to review it",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingReview) {
    return next(
      new AppError(
        "You have already reviewed this course",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const review = await Review.create({
    user: req.user._id,
    course: course._id,
    rating: Number(rating),
    comment,
  });

  await recalculateCourseRating(course._id);

  await review.populate("user", "firstName lastName avatar");

  const updatedCourse = await Course.findById(course._id).select(
    "averageRating ratingsCount",
  );

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Review created successfully",
    data: {
      review,
      ratingSummary: {
        averageRating: updatedCourse.averageRating,
        ratingsCount: updatedCourse.ratingsCount,
      },
    },
  });
});

// access public

const getCourseReviews = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { page, limit, skip } = getPagination(req.query);

  const course = await Course.findById(courseId).select(
    "title averageRating ratingsCount",
  );

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    "rating-high": {
      rating: -1,
      createdAt: -1,
    },

    "rating-low": {
      rating: 1,
      createdAt: -1,
    },
  };

  const sort = sortOptions[req.query.sort] || sortOptions.newest;

  const [reviews, totalReviews] = await Promise.all([
    Review.find({
      course: course._id,
    })
      .populate("user", "firstName lastName avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit),

    Review.countDocuments({
      course: course._id,
    }),
  ]);

  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: reviews.length,
    data: {
      course: {
        _id: course._id,
        title: course.title,
        averageRating: course.averageRating,
        ratingsCount: course.ratingsCount,
      },

      reviews,

      pagination: {
        currentPage: page,
        limit,
        totalReviews,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// access Authenticated
const getMyCourseReview = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select("_id title");

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const review = await Review.findOne({
    user: req.user._id,
    course: course._id,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      hasReviewed: Boolean(review),
      review,
    },
  });
});

// access  Review owner
const updateMyReview = asyncWrapper(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new AppError("Review not found", 404, httpStatusText.FAIL));
  }

  const isOwner = review.user.toString() === req.user._id.toString();

  if (!isOwner) {
    return next(
      new AppError("You cannot update this review", 403, httpStatusText.FAIL),
    );
  }

  if (req.body.rating !== undefined) {
    review.rating = Number(req.body.rating);
  }

  if (req.body.comment !== undefined) {
    review.comment = req.body.comment;
  }

  await review.save();

  await recalculateCourseRating(review.course);

  await review.populate("user", "firstName lastName avatar");

  const updatedCourse = await Course.findById(review.course).select(
    "averageRating ratingsCount",
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review updated successfully",
    data: {
      review,
      ratingSummary: {
        averageRating: updatedCourse.averageRating,
        ratingsCount: updatedCourse.ratingsCount,
      },
    },
  });
});

// access  Review owner or admin
const deleteReview = asyncWrapper(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new AppError("Review not found", 404, httpStatusText.FAIL));
  }

  const isOwner = review.user.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(
      new AppError("You cannot delete this review", 403, httpStatusText.FAIL),
    );
  }

  const courseId = review.course;

  await review.deleteOne();

  const ratingSummary = await recalculateCourseRating(courseId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review deleted successfully",
    data: {
      ratingSummary,
    },
  });
});

// access  Authenticated
const getMyReviews = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, totalReviews] = await Promise.all([
    Review.find({
      user: req.user._id,
    })
      .populate("course", "title coverImage averageRating ratingsCount")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Review.countDocuments({
      user: req.user._id,
    }),
  ]);

  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: reviews.length,
    data: {
      reviews,
      pagination: {
        currentPage: page,
        limit,
        totalReviews,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

module.exports = {
  createReview,
  getCourseReviews,
  getMyCourseReview,
  updateMyReview,
  deleteReview,
  getMyReviews,
};
