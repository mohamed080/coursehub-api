const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");
const Review = require("../models/review.model");

const getInstructorId = (req) => {
  if (req.user.role === "admin" && req.query.instructorId) {
    return req.query.instructorId;
  }

  return req.user._id;
};

const getYearRange = (year = new Date().getFullYear()) => {
  const parsedYear = Number(year) || new Date().getFullYear();

  return {
    year: parsedYear,
    startDate: new Date(Date.UTC(parsedYear, 0, 1)),
    endDate: new Date(Date.UTC(parsedYear + 1, 0, 1)),
  };
};

const buildMonthlyBuckets = (items, valueKey) => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    [valueKey]: 0,
  }));

  items.forEach((item) => {
    months[item._id.month - 1][valueKey] = item[valueKey];
  });

  return months;
};

const getInstructorCourseIds = async (instructorId, match = {}) => {
  const courses = await Course.find({
    instructor: instructorId,
    ...match,
  }).select("_id");

  return courses.map((course) => course._id);
};

const getCourseMetrics = async (courseIds) => {
  if (courseIds.length === 0) {
    return new Map();
  }

  const [revenueStats, enrollmentStats, ratingStats] = await Promise.all([
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
          _id: "$course",
          revenue: {
            $sum: "$finalAmount",
          },
          sales: {
            $sum: 1,
          },
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
          _id: "$course",
          students: {
            $sum: 1,
          },
          completedStudents: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]),

    Review.aggregate([
      {
        $match: {
          course: {
            $in: courseIds,
          },
        },
      },
      {
        $group: {
          _id: "$course",
          averageRating: {
            $avg: "$rating",
          },
          ratingsCount: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const metrics = new Map();

  courseIds.forEach((courseId) => {
    metrics.set(courseId.toString(), {
      revenue: 0,
      sales: 0,
      students: 0,
      completedStudents: 0,
      averageRating: 0,
      ratingsCount: 0,
    });
  });

  revenueStats.forEach((stat) => {
    Object.assign(metrics.get(stat._id.toString()), {
      revenue: stat.revenue,
      sales: stat.sales,
    });
  });

  enrollmentStats.forEach((stat) => {
    Object.assign(metrics.get(stat._id.toString()), {
      students: stat.students,
      completedStudents: stat.completedStudents,
    });
  });

  ratingStats.forEach((stat) => {
    Object.assign(metrics.get(stat._id.toString()), {
      averageRating: Number(stat.averageRating.toFixed(1)),
      ratingsCount: stat.ratingsCount,
    });
  });

  return metrics;
};

module.exports = {
  buildMonthlyBuckets,
  getCourseMetrics,
  getInstructorCourseIds,
  getInstructorId,
  getYearRange,
};
