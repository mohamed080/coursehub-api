const baseTemplate = require("./base.template");

const emailVerificationTemplate = ({ firstName, verificationUrl }) =>
  baseTemplate({
    title: "Verify Your Email",
    preview: "Verify your email address to get started with CourseHub.",
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Verify your email</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Hi ${firstName}, welcome to CourseHub! Click the button below to verify your email address.</p>
      <p style="margin:24px 0;">
        <a href="${verificationUrl}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block;">Verify email</a>
      </p>
      <p style="margin:0;color:#667085;font-size:13px;line-height:1.6;">If the button does not work, open this link: ${verificationUrl}</p>
      <p style="margin:16px 0 0;color:#667085;font-size:13px;line-height:1.6;"><strong>Note:</strong> This link expires in 24 hours.</p>
    `,
  });

module.exports = emailVerificationTemplate;
