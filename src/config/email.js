const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth:
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          }
        : undefined,
  });
};

module.exports = createTransporter;
