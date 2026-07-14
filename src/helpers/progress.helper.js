const Lesson = require("../models/lesson.model");
const Progress = require("../models/progress.model");

const calculateCourseProgress = async (userId, courseId) => {
  const [totalLessons, completedLessons] = await Promise.all([
    Lesson.countDocuments({
      course: courseId,
    }),

    Progress.countDocuments({
      user: userId,
      course: courseId,
    }),
  ]);

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 10000) / 100;

  return {
    totalLessons,
    completedLessons,
    remainingLessons: totalLessons - completedLessons,
    progressPercentage,
    isCompleted: totalLessons > 0 && completedLessons === totalLessons,
  };
};

module.exports = {
  calculateCourseProgress,
};
