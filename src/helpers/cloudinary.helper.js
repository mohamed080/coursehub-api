const cloudinary = require("../config/cloudinary");

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary image ${publicId}:`,
      error.message
    );
  }
};

module.exports = {
  deleteCloudinaryImage,
};