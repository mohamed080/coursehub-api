const mongoose = require("mongoose");

const Review = require("../models/review.model");
const Course = require("../models/course.model");

const recalculateCourseRating = async (courseId) => {
  const ratingStats = await Review.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
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
  ]);

  if (ratingStats.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      ratingsCount: 0,
    });

    return {
      averageRating: 0,
      ratingsCount: 0,
    };
  }

  const averageRating = Math.round(ratingStats[0].averageRating * 10) / 10;

  const ratingsCount = ratingStats[0].ratingsCount;

  await Course.findByIdAndUpdate(courseId, {
    averageRating,
    ratingsCount,
  });

  return {
    averageRating,
    ratingsCount,
  };
};

module.exports = {
  recalculateCourseRating,
};
