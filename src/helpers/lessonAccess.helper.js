const Enrollment = require("../models/enrollment.model");

const isCourseManager = (course, user) => {
  if (!user) return false;

  const instructorId = course.instructor?._id || course.instructor;
  const isOwner = instructorId.toString() === user._id.toString();
  const isInstructor = user.role === "instructor";
  const isAdmin = user.role === "admin";

  return (isOwner && isInstructor) || isAdmin;
};

const isUserEnrolled = async (courseId, userId) => {
  if (!userId) return false;

  const enrollment = await Enrollment.exists({
    user: userId,
    course: courseId,
    status: {
      $in: ["active", "completed"],
    },
  });

  return Boolean(enrollment);
};

const canAccessLesson = async ({ lesson, course, user }) => {
  if (isCourseManager(course, user)) {
    return true;
  }

  if (course.status !== "published") {
    return false;
  }

  if (lesson.isPreview) {
    return true;
  }

  return isUserEnrolled(course._id, user?._id);
};

module.exports = {
  isCourseManager,
  isUserEnrolled,
  canAccessLesson,
};
