const Progress = require("../models/progress.model");
const Lesson = require("../models/lesson.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const { calculateCourseProgress } = require("../helpers/progress.helper");

// access  Enrolled student
const markLessonAsCompleted = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(
      new AppError(
        "Course associated with this lesson was not found",
        404,
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
        "You must be enrolled in this course to track progress",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingProgress = await Progress.findOne({
    user: req.user._id,
    lesson: lesson._id,
  });

  if (existingProgress) {
    return next(
      new AppError(
        "Lesson is already marked as completed",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const progress = await Progress.create({
    user: req.user._id,
    course: course._id,
    lesson: lesson._id,
  });

  const progressSummary = await calculateCourseProgress(
    req.user._id,
    course._id,
  );

  /*
   * Update the enrollment summary so the user's
   * enrolled-course list can return progress quickly.
   */
  enrollment.progress = progressSummary.progressPercentage;

  if (progressSummary.isCompleted) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  await progress.populate([
    {
      path: "lesson",
      select: "title order section",
      populate: {
        path: "section",
        select: "title order",
      },
    },
    {
      path: "course",
      select: "title coverImage",
    },
  ]);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Lesson marked as completed",
    data: {
      progress,
      progressSummary,
    },
  });
});

// access  Enrolled student
const removeLessonCompletion = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You are not enrolled in this course",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const deletedProgress = await Progress.findOneAndDelete({
    user: req.user._id,
    lesson: lesson._id,
  });

  if (!deletedProgress) {
    return next(
      new AppError(
        "Lesson is not marked as completed",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  const progressSummary = await calculateCourseProgress(
    req.user._id,
    lesson.course,
  );

  enrollment.progress = progressSummary.progressPercentage;

  /*
   * If a completed enrollment loses progress,
   * return it to active status.
   */
  if (!progressSummary.isCompleted) {
    enrollment.status = "active";
    enrollment.completedAt = null;
  }

  await enrollment.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Lesson completion removed successfully",
    data: {
      progressSummary,
    },
  });
});

// access  Enrolled student
const getMyCourseProgress = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select(
    "title coverImage status instructor",
  );

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You must be enrolled in this course to view progress",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const progressSummary = await calculateCourseProgress(
    req.user._id,
    course._id,
  );

  const completedProgress = await Progress.find({
    user: req.user._id,
    course: course._id,
  })
    .populate({
      path: "lesson",
      select: "title order section isPreview video.duration",
      populate: {
        path: "section",
        select: "title order",
      },
    })
    .sort({
      completedAt: 1,
    });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course: {
        _id: course._id,
        title: course.title,
        coverImage: course.coverImage,
      },

      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      },

      progressSummary,
      completedLessons: completedProgress,
    },
  });
});

// access  Authenticated
const getLessonCompletionStatus = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId).select(
    "_id title course",
  );

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You are not enrolled in this course",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const progress = await Progress.findOne({
    user: req.user._id,
    lesson: lesson._id,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isCompleted: Boolean(progress),
      completedAt: progress?.completedAt || null,
    },
  });
});

module.exports = {
  markLessonAsCompleted,
  removeLessonCompletion,
  getMyCourseProgress,
  getLessonCompletionStatus,
};
