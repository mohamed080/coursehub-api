const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const MAX_GALLERY_IMAGES = 10;

const canManageCourse = (course, user) => {
  return (
    course.instructor.toString() === user._id.toString() ||
    user.role === "admin"
  );
};

const checkCourseOwnership = (course, user) => {
  if (!canManageCourse(course, user)) {
    throw new AppError(
      "You do not have permission to manage this course",
      403,
      httpStatusText.FAIL
    );
  }
};

const validateGalleryLimit = (course, filesCount) => {
  const availableSlots = MAX_GALLERY_IMAGES - course.gallery.length;

  if (availableSlots <= 0) {
    throw new AppError(
      `Course gallery already contains the maximum of ${MAX_GALLERY_IMAGES} images`,
      400,
      httpStatusText.FAIL
    );
  }

  if (filesCount > availableSlots) {
    throw new AppError(
      `You can upload only ${availableSlots} more image(s)`,
      400,
      httpStatusText.FAIL
    );
  }
};

module.exports = {
  MAX_GALLERY_IMAGES,
  canManageCourse,
  checkCourseOwnership,
  validateGalleryLimit,
};