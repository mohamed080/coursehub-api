const cloudinary = require("../config/cloudinary");

const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary ${resourceType} ${publicId}:`,
      error.message,
    );
  }
};

const deleteCloudinaryImage = async (publicId) => {
  return deleteCloudinaryAsset(publicId, "image");
};

const deleteCloudinaryVideo = async (publicId) => {
  return deleteCloudinaryAsset(publicId, "video");
};

module.exports = {
  deleteCloudinaryAsset,
  deleteCloudinaryImage,
  deleteCloudinaryVideo,
};
