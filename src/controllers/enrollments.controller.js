const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getPagination = require("../helpers/pagination.helper");
const { checkCourseOwnership } = require("../helpers/course.helper");

// access  Authenticated
const enrollInCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  if (course.status !== "published") {
    return next(
      new AppError(
        "You can only enroll in published courses",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const isCourseInstructor =
    course.instructor.toString() === req.user._id.toString();

  if (isCourseInstructor) {
    return next(
      new AppError(
        "You cannot enroll in your own course",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingEnrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingEnrollment) {
    return next(
      new AppError(
        "You are already enrolled in this course",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const enrollment = await Enrollment.create({
    user: req.user._id,
    course: course._id,
  });

  await enrollment.populate([
    {
      path: "user",
      select: "firstName lastName email avatar",
    },
    {
      path: "course",
      select: "title description price coverImage status category instructor",
      populate: [
        {
          path: "category",
          select: "name slug",
        },
        {
          path: "instructor",
          select: "firstName lastName avatar",
        },
      ],
    },
  ]);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Course enrollment completed successfully",
    data: {
      enrollment,
    },
  });
});

//  access  Authenticated
const getMyEnrollments = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    user: req.user._id,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [enrollments, totalEnrollments] = await Promise.all([
    Enrollment.find(filter)
      .populate({
        path: "course",
        select: "title description price coverImage status category instructor",
        populate: [
          {
            path: "category",
            select: "name slug",
          },
          {
            path: "instructor",
            select: "firstName lastName avatar",
          },
        ],
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit),

    Enrollment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalEnrollments / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: enrollments.length,
    data: {
      enrollments,
      pagination: {
        currentPage: page,
        limit,
        totalEnrollments,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

//  access  Authenticated
const getMyEnrollmentStatus = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select(
    "_id title status",
  );

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isEnrolled: Boolean(enrollment),
      enrollment,
    },
  });
});

//  access  Authenticated
const cancelMyEnrollment = asyncWrapper(async (req, res, next) => {
  const enrollment = await Enrollment.findOneAndDelete({
    user: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You are not enrolled in this course",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course enrollment cancelled successfully",
    data: null,
  });
});

// access  Course instructor or admin
const getCourseStudents = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    course: course._id,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [enrollments, totalStudents] = await Promise.all([
    Enrollment.find(filter)
      .populate("user", "firstName lastName email avatar isActive")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit),

    Enrollment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalStudents / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: enrollments.length,
    data: {
      course: {
        _id: course._id,
        title: course.title,
      },
      enrollments,
      pagination: {
        currentPage: page,
        limit,
        totalStudents,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// access  Course instructor or admin
const removeStudentEnrollment = asyncWrapper(async (req, res, next) => {
  const { courseId, enrollmentId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  const enrollment = await Enrollment.findOneAndDelete({
    _id: enrollmentId,
    course: course._id,
  });

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Student enrollment removed successfully",
    data: null,
  });
});

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getMyEnrollmentStatus,
  cancelMyEnrollment,
  getCourseStudents,
  removeStudentEnrollment,
};
