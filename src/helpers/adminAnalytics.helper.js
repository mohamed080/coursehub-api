const User = require("../models/user.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");
const Review = require("../models/review.model");

/**
 * Returns the start and end of the current month (UTC).
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );
  return { start, end };
};

/**
 * Build a full 12-month array (zeros for missing months).
 */
const buildMonthlyBuckets = (items, valueKey) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    [valueKey]: 0,
  }));

  items.forEach((item) => {
    if (item._id && item._id.month && months[item._id.month - 1]) {
      months[item._id.month - 1][valueKey] = item[valueKey];
    }
  });

  return months;
};

/**
 * Parse date range supporting `from` (`YYYY-MM-DD`), `to` (`YYYY-MM-DD`), or falling back to `year`.
 */
const parseDateRange = ({ from, to, year }) => {
  if (from || to) {
    const startDate = from ? new Date(from) : new Date(Date.UTC(2000, 0, 1));
    const endDate = to ? new Date(to) : new Date();
    // Ensure endDate includes the full day if date string passed
    if (to && to.length === 10) {
      endDate.setUTCHours(23, 59, 59, 999);
    }
    return {
      isCustomRange: true,
      startDate,
      endDate,
    };
  }

  const parsedYear = Number(year) || new Date().getUTCFullYear();
  return {
    isCustomRange: false,
    year: parsedYear,
    startDate: new Date(Date.UTC(parsedYear, 0, 1)),
    endDate: new Date(Date.UTC(parsedYear + 1, 0, 1)),
  };
};

/**
 * Parse and validate a year query param, defaulting to the current year.
 */
const parseYear = (rawYear) => {
  const year = Number(rawYear) || new Date().getUTCFullYear();
  return {
    year,
    startDate: new Date(Date.UTC(year, 0, 1)),
    endDate: new Date(Date.UTC(year + 1, 0, 1)),
  };
};

module.exports = {
  getCurrentMonthRange,
  buildMonthlyBuckets,
  parseDateRange,
  parseYear,
  User,
  Course,
  Enrollment,
  Payment,
  Review,
};
