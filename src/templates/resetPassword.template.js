const baseTemplate = require("./base.template");

const resetPasswordTemplate = ({ firstName, resetUrl }) =>
  baseTemplate({
    title: "Reset Your Password",
    preview: "Use this link to reset your CourseHub password.",
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Reset your password</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Hi ${firstName}, use the button below to reset your password. This link expires in 10 minutes.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block;">Reset password</a>
      </p>
      <p style="margin:0;color:#667085;font-size:13px;line-height:1.6;">If the button does not work, open this link: ${resetUrl}</p>
    `,
  });

module.exports = resetPasswordTemplate;
