const crypto = require("crypto");

const Certificate = require("../models/certificate.model");

const generateVerificationCode = () => {
  const randomPart = crypto.randomBytes(6).toString("hex").toUpperCase();

  const year = new Date().getFullYear();

  return `COURSEHUB-${year}-${randomPart}`;
};

const generateUniqueVerificationCode = async () => {
  let verificationCode;
  let codeExists = true;

  while (codeExists) {
    verificationCode = generateVerificationCode();

    codeExists = await Certificate.exists({
      verificationCode,
    });
  }

  return verificationCode;
};

const populateCertificate = async (certificate) => {
  return certificate.populate([
    {
      path: "user",
      select: "firstName lastName email avatar",
    },
    {
      path: "course",
      select: "title description coverImage instructor category averageRating",
      populate: [
        {
          path: "instructor",
          select: "firstName lastName avatar",
        },
        {
          path: "category",
          select: "name slug",
        },
      ],
    },
    {
      path: "enrollment",
      select: "status progress enrolledAt completedAt",
    },
  ]);
};

module.exports = {
  generateUniqueVerificationCode,
  populateCertificate,
};
