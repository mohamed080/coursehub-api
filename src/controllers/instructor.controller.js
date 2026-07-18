const mongoose = require("mongoose");

const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");
const Review = require("../models/review.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const getPagination = require("../helpers/pagination.helper");
const {
  buildMonthlyBuckets,
  getCourseMetrics,
  getInstructorCourseIds,
  getInstructorId,
  getYearRange,
} = require("../helpers/instructorAnalytics.helper");

const ensureCourseAccess = async (courseId, req) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new AppError("Invalid course ID", 400, httpStatusText.FAIL);
  }

  const filter = {
    _id: courseId,
  };

  if (req.user.role !== "admin") {
    filter.instructor = req.user._id;
  } else if (req.query.instructorId) {
    filter.instructor = req.query.instructorId;
  }

  const course = await Course.findOne(filter).populate("category", "name slug");

  if (!course) {
    throw new AppError("Course not found", 404, httpStatusText.FAIL);
  }

  return course;
};

const getDashboard = asyncWrapper(async (req, res) => {
  const instructorId = getInstructorId(req);
  const courseIds = await getInstructorCourseIds(instructorId);

  const [
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    metrics,
  ] = await Promise.all([
    Course.countDocuments({ instructor: instructorId }),
    Course.countDocuments({ instructor: instructorId, status: "published" }),
    Course.countDocuments({ instructor: instructorId, status: "draft" }),
    Course.countDocuments({ instructor: instructorId, status: "archived" }),
    getCourseMetrics(courseIds),
  ]);

  const totals = Array.from(metrics.values()).reduce(
    (summary, metric) => {
      summary.totalRevenue += metric.revenue;
      summary.totalSales += metric.sales;
      summary.totalStudents += metric.students;
      summary.totalRatings += metric.ratingsCount;
      summary.ratingSum += metric.averageRating * metric.ratingsCount;

      return summary;
    },
    {
      totalRevenue: 0,
      totalSales: 0,
      totalStudents: 0,
      totalRatings: 0,
      ratingSum: 0,
    },
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      summary: {
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        totalStudents: totals.totalStudents,
        totalRevenue: totals.totalRevenue,
        totalSales: totals.totalSales,
        averageRating:
          totals.totalRatings > 0
            ? Number((totals.ratingSum / totals.totalRatings).toFixed(1))
            : 0,
      },
    },
  });
});

const getMyCourses = asyncWrapper(async (req, res) => {
  const instructorId = getInstructorId(req);
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    instructor: instructorId,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search?.trim()) {
    filter.$or = [
      {
        title: {
          $regex: req.query.search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: req.query.search.trim(),
          $options: "i",
        },
      },
    ];
  }

  const [courses, totalCourses] = await Promise.all([
    Course.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  const metrics = await getCourseMetrics(courses.map((course) => course._id));

  const totalPages = Math.ceil(totalCourses / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: courses.length,
    data: {
      courses: courses.map((course) => ({
        ...course.toObject(),
        analytics: metrics.get(course._id.toString()),
      })),
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

const getRevenueAnalytics = asyncWrapper(async (req, res) => {
  const instructorId = getInstructorId(req);
  const courseIds = await getInstructorCourseIds(instructorId);
  const { year, startDate, endDate } = getYearRange(req.query.year);

  const [monthlyRevenue, totalRevenueResult] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          status: "paid",
          course: {
            $in: courseIds,
          },
          paidAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$paidAt",
            },
          },
          revenue: {
            $sum: "$finalAmount",
          },
          sales: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: "paid",
          course: {
            $in: courseIds,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$finalAmount",
          },
          totalSales: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      year,
      totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
      totalSales: totalRevenueResult[0]?.totalSales || 0,
      monthlyRevenue: buildMonthlyBuckets(monthlyRevenue, "revenue").map(
        (month) => ({
          ...month,
          sales:
            monthlyRevenue.find((item) => item._id.month === month.month)
              ?.sales || 0,
        }),
      ),
    },
  });
});

const getEnrollmentAnalytics = asyncWrapper(async (req, res) => {
  const instructorId = getInstructorId(req);
  const courseIds = await getInstructorCourseIds(instructorId);
  const { year, startDate, endDate } = getYearRange(req.query.year);

  const [monthlyEnrollments, statusStats] = await Promise.all([
    Enrollment.aggregate([
      {
        $match: {
          course: {
            $in: courseIds,
          },
          enrolledAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$enrolledAt",
            },
          },
          enrollments: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]),
    Enrollment.aggregate([
      {
        $match: {
          course: {
            $in: courseIds,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const statusCounts = statusStats.reduce(
    (counts, item) => ({
      ...counts,
      [item._id]: item.count,
    }),
    {
      active: 0,
      completed: 0,
    },
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      year,
      totalEnrollments: statusCounts.active + statusCounts.completed,
      activeEnrollments: statusCounts.active,
      completedEnrollments: statusCounts.completed,
      monthlyEnrollments: buildMonthlyBuckets(
        monthlyEnrollments,
        "enrollments",
      ),
    },
  });
});

const getTopCourses = asyncWrapper(async (req, res) => {
  const instructorId = getInstructorId(req);
  const requestedLimit = Number(req.query.limit) || 5;
  const limit = Math.min(Math.max(requestedLimit, 1), 20);
  const sortBy = ["revenue", "students", "rating"].includes(req.query.sortBy)
    ? req.query.sortBy
    : "revenue";

  const courses = await Course.find({ instructor: instructorId })
    .select("title status price coverImage averageRating ratingsCount")
    .sort({ createdAt: -1 });

  const metrics = await getCourseMetrics(courses.map((course) => course._id));

  const topCourses = courses
    .map((course) => ({
      ...course.toObject(),
      analytics: metrics.get(course._id.toString()),
    }))
    .sort((firstCourse, secondCourse) => {
      if (sortBy === "rating") {
        return (
          secondCourse.analytics.averageRating -
          firstCourse.analytics.averageRating
        );
      }

      return secondCourse.analytics[sortBy] - firstCourse.analytics[sortBy];
    })
    .slice(0, limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: topCourses.length,
    data: {
      sortBy,
      courses: topCourses,
    },
  });
});

const getCourseAnalytics = asyncWrapper(async (req, res) => {
  const course = await ensureCourseAccess(req.params.courseId, req);
  const courseIds = [course._id];
  const { year, startDate, endDate } = getYearRange(req.query.year);

  const [metrics, monthlyRevenue, monthlyEnrollments, ratingStats] =
    await Promise.all([
      getCourseMetrics(courseIds),
      Payment.aggregate([
        {
          $match: {
            status: "paid",
            course: course._id,
            paidAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month: "$paidAt",
              },
            },
            revenue: {
              $sum: "$finalAmount",
            },
          },
        },
      ]),
      Enrollment.aggregate([
        {
          $match: {
            course: course._id,
            enrolledAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month: "$enrolledAt",
              },
            },
            enrollments: {
              $sum: 1,
            },
          },
        },
      ]),
      Review.aggregate([
        {
          $match: {
            course: course._id,
          },
        },
        {
          $group: {
            _id: "$rating",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      year,
      course,
      analytics: metrics.get(course._id.toString()),
      monthlyRevenue: buildMonthlyBuckets(monthlyRevenue, "revenue"),
      monthlyEnrollments: buildMonthlyBuckets(
        monthlyEnrollments,
        "enrollments",
      ),
      ratingBreakdown: ratingStats.map((item) => ({
        rating: item._id,
        count: item.count,
      })),
    },
  });
});

module.exports = {
  getCourseAnalytics,
  getDashboard,
  getEnrollmentAnalytics,
  getMyCourses,
  getRevenueAnalytics,
  getTopCourses,
};
