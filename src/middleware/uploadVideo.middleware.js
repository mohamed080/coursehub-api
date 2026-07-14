const multer = require("multer");

const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const storage = multer.memoryStorage();

const videoFileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new AppError(
        "Only MP4, WebM, MOV and MKV videos are allowed",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  callback(null, true);
};

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    // 100 MB
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
});

module.exports = uploadVideo;
