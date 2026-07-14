const Section = require("../models/section.model");
const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getPagination = require("../helpers/pagination.helper");

const { checkCourseOwnership } = require("../helpers/course.helper");

// access  Course owner or admin
const createSection = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, order } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  checkCourseOwnership(course, req.user);

  const existingOrder = await Section.findOne({
    course: course._id,
    order: Number(order),
  });

  if (existingOrder) {
    return next(
      new AppError(
        `A section with order ${order} already exists in this course`,
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const section = await Section.create({
    title,
    description,
    order: Number(order),
    course: course._id,
  });

  await section.populate("course", "title status instructor");

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Section created successfully",
    data: {
      section,
    },
  });
});

//   access  Public for published courses,
//    owner/admin for unpublished courses
const getCourseSections = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  if (course.status !== "published") {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication is required to view this course content",
          401,
          httpStatusText.FAIL,
        ),
      );
    }

    checkCourseOwnership(course, req.user);
  }

  const { page, limit, skip } = getPagination(req.query);

  const [sections, totalSections] = await Promise.all([
    Section.find({
      course: course._id,
    })
      .sort({
        order: 1,
      })
      .skip(skip)
      .limit(limit),

    Section.countDocuments({
      course: course._id,
    }),
  ]);

  const totalPages = Math.ceil(totalSections / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: sections.length,
    data: {
      course: {
        _id: course._id,
        title: course.title,
        status: course.status,
      },

      sections,

      pagination: {
        currentPage: page,
        limit,
        totalSections,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

//  access  Public for published courses,
//    owner/admin for unpublished courses

const getSectionById = asyncWrapper(async (req, res, next) => {
  const section = await Section.findById(req.params.sectionId).populate(
    "course",
    "title status instructor",
  );

  if (!section) {
    return next(new AppError("Section not found", 404, httpStatusText.FAIL));
  }

  if (section.course.status !== "published") {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication is required to view this section",
          401,
          httpStatusText.FAIL,
        ),
      );
    }

    checkCourseOwnership(section.course, req.user);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      section,
    },
  });
});

//  access  Course owner or admin
const updateSection = asyncWrapper(async (req, res, next) => {
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

  checkCourseOwnership(course, req.user);

  const { title, description, order } = req.body;

  if (order !== undefined && Number(order) !== section.order) {
    const existingOrder = await Section.findOne({
      course: course._id,
      order: Number(order),
      _id: {
        $ne: section._id,
      },
    });

    if (existingOrder) {
      return next(
        new AppError(
          `A section with order ${order} already exists in this course`,
          409,
          httpStatusText.FAIL,
        ),
      );
    }

    section.order = Number(order);
  }

  if (title !== undefined) {
    section.title = title;
  }

  if (description !== undefined) {
    section.description = description;
  }

  await section.save();

  await section.populate("course", "title status instructor");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Section updated successfully",
    data: {
      section,
    },
  });
});

//  access  Course owner or admin
const deleteSection = asyncWrapper(async (req, res, next) => {
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

  checkCourseOwnership(course, req.user);

  await section.deleteOne();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Section deleted successfully",
    data: null,
  });
});

module.exports = {
  createSection,
  getCourseSections,
  getSectionById,
  updateSection,
  deleteSection,
};
