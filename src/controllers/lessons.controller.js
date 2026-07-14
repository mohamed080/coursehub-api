const Lesson = require("../models/lesson.model");
const Section = require("../models/section.model");
const Course = require("../models/course.model");
const Progress = require("../models/progress.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const { uploadBufferToCloudinary } = require("../utils/uploadToCloudinary");

const { deleteCloudinaryVideo } = require("../helpers/cloudinary.helper");

const { checkCourseOwnership } = require("../helpers/course.helper");

const {
  isCourseManager,
  isUserEnrolled,
  canAccessLesson,
} = require("../helpers/lessonAccess.helper");

const getPagination = require("../helpers/pagination.helper");

const createLesson = asyncWrapper(async (req, res, next) => {
  const { sectionId } = req.params;
  const { title, description, order, isPreview } = req.body;

  const section = await Section.findById(sectionId);

  if (!section) {
    return next(new AppError("Section not found", 404, httpStatusText.FAIL));
  }

  const course = await Course.findById(section.course);

  if (!course) {
    return next(
      new AppError(
        "Course associated with this section was not found",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  checkCourseOwnership(course, req.user);

  if (!req.file) {
    return next(
      new AppError("Lesson video is required", 400, httpStatusText.FAIL),
    );
  }

  const existingOrder = await Lesson.findOne({
    section: section._id,
    order: Number(order),
  });

  if (existingOrder) {
    return next(
      new AppError(
        `A lesson with order ${order} already exists in this section`,
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  let uploadedVideo;

  try {
    uploadedVideo = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `coursehub/courses/${course._id}/lessons`,
      resourceType: "video",
    });

    const lesson = await Lesson.create({
      title,
      description,
      order: Number(order),
      isPreview: isPreview === true || isPreview === "true",
      video: {
        url: uploadedVideo.url,
        publicId: uploadedVideo.publicId,
        duration: uploadedVideo.duration,
        format: uploadedVideo.format,
        bytes: uploadedVideo.bytes,
      },
      section: section._id,
      course: course._id,
    });

    await lesson.populate([
      {
        path: "section",
        select: "title order",
      },
      {
        path: "course",
        select: "title status instructor",
      },
    ]);

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "Lesson created successfully",
      data: {
        lesson,
      },
    });
  } catch (error) {
    if (uploadedVideo?.publicId) {
      await deleteCloudinaryVideo(uploadedVideo.publicId);
    }

    throw error;
  }
});

const getSectionLessons = asyncWrapper(async (req, res, next) => {
  const section = await Section.findById(req.params.sectionId);

  if (!section) {
    return next(new AppError("Section not found", 404, httpStatusText.FAIL));
  }

  const course = await Course.findById(section.course);

  if (!course) {
    return next(
      new AppError(
        "Course associated with this section was not found",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  const managerAccess = isCourseManager(course, req.user);

  const enrolled = managerAccess
    ? true
    : await isUserEnrolled(course._id, req.user?._id);

  if (course.status !== "published" && !managerAccess) {
    return next(
      new AppError(
        "You do not have permission to view these lessons",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const { page, limit, skip } = getPagination(req.query);

  const [lessons, totalLessons] = await Promise.all([
    Lesson.find({
      section: section._id,
    })
      .sort({
        order: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Lesson.countDocuments({
      section: section._id,
    }),
  ]);

  const safeLessons = lessons.map((lesson) => {
    const hasAccess = managerAccess || enrolled || lesson.isPreview;

    return {
      ...lesson,
      isLocked: !hasAccess,
      video: hasAccess ? lesson.video : undefined,
    };
  });

  const totalPages = Math.ceil(totalLessons / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: safeLessons.length,
    data: {
      course: {
        _id: course._id,
        title: course.title,
      },
      section: {
        _id: section._id,
        title: section.title,
        order: section.order,
      },
      lessons: safeLessons,
      pagination: {
        currentPage: page,
        limit,
        totalLessons,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const getLessonById = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId)
    .populate("section", "title description order")
    .populate("course", "title status instructor coverImage");

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  const hasAccess = await canAccessLesson({
    lesson,
    course: lesson.course,
    user: req.user,
  });

  if (!hasAccess) {
    return next(
      new AppError(
        "You must enroll in this course to access this lesson",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      lesson,
    },
  });
});

const updateLesson = asyncWrapper(async (req, res, next) => {
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

  checkCourseOwnership(course, req.user);

  const { title, description, order, isPreview } = req.body;

  if (order !== undefined && Number(order) !== lesson.order) {
    const existingOrder = await Lesson.findOne({
      section: lesson.section,
      order: Number(order),
      _id: {
        $ne: lesson._id,
      },
    });

    if (existingOrder) {
      return next(
        new AppError(
          `A lesson with order ${order} already exists in this section`,
          409,
          httpStatusText.FAIL,
        ),
      );
    }

    lesson.order = Number(order);
  }

  if (title !== undefined) {
    lesson.title = title;
  }

  if (description !== undefined) {
    lesson.description = description;
  }

  if (isPreview !== undefined) {
    lesson.isPreview = isPreview === true || isPreview === "true";
  }

  let newUploadedVideo = null;
  const oldVideoPublicId = lesson.video?.publicId;

  try {
    if (req.file) {
      newUploadedVideo = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `coursehub/courses/${course._id}/lessons`,
        resourceType: "video",
      });

      lesson.video = {
        url: newUploadedVideo.url,
        publicId: newUploadedVideo.publicId,
        duration: newUploadedVideo.duration,
        format: newUploadedVideo.format,
        bytes: newUploadedVideo.bytes,
      };
    }

    await lesson.save();
  } catch (error) {
    if (newUploadedVideo?.publicId) {
      await deleteCloudinaryVideo(newUploadedVideo.publicId);
    }

    throw error;
  }

  if (req.file && oldVideoPublicId) {
    await deleteCloudinaryVideo(oldVideoPublicId);
  }

  await lesson.populate([
    {
      path: "section",
      select: "title order",
    },
    {
      path: "course",
      select: "title status instructor",
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Lesson updated successfully",
    data: {
      lesson,
    },
  });
});

const deleteLesson = asyncWrapper(async (req, res, next) => {
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

  checkCourseOwnership(course, req.user);

  const videoPublicId = lesson.video?.publicId;

  await Progress.deleteMany({ lesson: lesson._id });

  await lesson.deleteOne();

  await deleteCloudinaryVideo(videoPublicId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Lesson deleted successfully",
    data: null,
  });
});

module.exports = {
  createLesson,
  getSectionLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
};
