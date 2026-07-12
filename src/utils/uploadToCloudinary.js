const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error("File buffer is required"));
    }

    let settled = false;
    const timeoutMs = options.timeoutMs || 30000;

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      uploadStream.destroy();
      reject(new Error("Cloudinary upload timed out"));
    }, timeoutMs);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "coursehub/uploads",
        resource_type: "image",
        transformation: options.transformation,
      },
      (error, result) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);

        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary returned no upload result"));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadBufferToCloudinary,
};
