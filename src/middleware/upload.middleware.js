const multer = require("multer");

const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new AppError(
        "Only JPG, JPEG, PNG and WebP images are allowed",
        400,
        httpStatusText.FAIL
      )
    );
  }

  callback(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

module.exports = uploadImage;