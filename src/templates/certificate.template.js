const baseTemplate = require("./base.template");

const certificateTemplate = ({ firstName, courseTitle, verificationCode }) =>
  baseTemplate({
    title: "Certificate Generated",
    preview: `Your certificate for ${courseTitle} is ready.`,
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Certificate ready</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Congratulations ${firstName}, your certificate has been generated.</p>
      <p style="margin:0 0 8px;line-height:1.6;"><strong>Course:</strong> ${courseTitle}</p>
      <p style="margin:0;line-height:1.6;"><strong>Verification code:</strong> ${verificationCode}</p>
    `,
  });

module.exports = certificateTemplate;
