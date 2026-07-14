const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error("File buffer is required"));
    }

    let settled = false;

    const resolveOnce = (value) => {
      if (settled) return;

      settled = true;
      resolve(value);
    };

    const rejectOnce = (error) => {
      if (settled) return;

      settled = true;
      reject(error);
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "coursehub/uploads",
        resource_type: options.resourceType || "image",
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) {
          return rejectOnce(error);
        }

        if (!result) {
          return rejectOnce(
            new Error("Cloudinary returned an empty upload result"),
          );
        }

        resolveOnce({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          duration: result.duration || null,
          bytes: result.bytes || null,
          width: result.width || null,
          height: result.height || null,
        });
      },
    );

    uploadStream.on("error", rejectOnce);

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadBufferToCloudinary,
};