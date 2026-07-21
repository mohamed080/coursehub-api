const createTransporter = require("../config/email");
const certificateTemplate = require("../templates/certificate.template");
const couponCreatedTemplate = require("../templates/couponCreated.template");
const instructorEnrollmentTemplate = require("../templates/instructorEnrollment.template");
const purchaseTemplate = require("../templates/purchase.template");
const resetPasswordTemplate = require("../templates/resetPassword.template");
const welcomeTemplate = require("../templates/welcome.template");
const emailVerificationTemplate = require("../templates/emailVerification.template");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter || !to) {
    return false;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM
      ? `"CourseHub" <${process.env.EMAIL_FROM}>`
      : '"CourseHub" <no-reply@coursehub.local>',
    to,
    subject,
    html,
  });

  return true;
};

const sendEmailSafely = (payload) => {
  sendEmail(payload).catch((error) => {
    console.error("Email delivery failed:", error.message);
  });
};

const sendWelcomeEmail = (user) =>
  sendEmailSafely({
    to: user.email,
    subject: "🎉 Welcome to CourseHub",
    html: welcomeTemplate({
      firstName: user.firstName,
      role: user.role,
    }),
  });

const sendPurchaseEmail = ({ user, course, payment }) =>
  sendEmailSafely({
    to: user.email,
    subject: "Course purchase confirmed",
    html: purchaseTemplate({
      firstName: user.firstName,
      courseTitle: course.title,
      amount: payment.finalAmount,
      currency: payment.currency,
    }),
  });

const sendResetPasswordEmail = ({ user, resetUrl }) =>
  sendEmail({
    to: user.email,
    subject: "Reset your CourseHub password",
    html: resetPasswordTemplate({
      firstName: user.firstName,
      resetUrl,
    }),
  });

const sendCertificateEmail = ({ user, course, certificate }) =>
  sendEmailSafely({
    to: user.email,
    subject: "Your CourseHub certificate is ready",
    html: certificateTemplate({
      firstName: user.firstName,
      courseTitle: course.title,
      verificationCode: certificate.verificationCode,
    }),
  });

const sendInstructorEnrollmentEmail = ({ instructor, student, course }) =>
  sendEmailSafely({
    to: instructor.email,
    subject: "New student enrollment",
    html: instructorEnrollmentTemplate({
      instructorName: instructor.firstName,
      studentName: `${student.firstName} ${student.lastName}`,
      courseTitle: course.title,
    }),
  });

const sendCouponCreatedEmail = ({ admin, coupon }) =>
  sendEmailSafely({
    to: admin.email,
    subject: "Coupon created",
    html: couponCreatedTemplate({
      adminName: admin.firstName,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    }),
  });

const sendVerificationEmail = ({ user, verificationUrl }) =>
  sendEmail({
    to: user.email,
    subject: "Verify your CourseHub email",
    html: emailVerificationTemplate({
      firstName: user.firstName,
      verificationUrl,
    }),
  });

module.exports = {
  sendCertificateEmail,
  sendCouponCreatedEmail,
  sendInstructorEnrollmentEmail,
  sendPurchaseEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
};
