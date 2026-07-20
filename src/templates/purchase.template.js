const baseTemplate = require("./base.template");

const purchaseTemplate = ({ firstName, courseTitle, amount, currency }) =>
  baseTemplate({
    title: "Course Purchase Confirmed",
    preview: `You are enrolled in ${courseTitle}.`,
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Purchase confirmed</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Hi ${firstName}, your payment was successful and you are now enrolled.</p>
      <p style="margin:0 0 8px;line-height:1.6;"><strong>Course:</strong> ${courseTitle}</p>
      <p style="margin:0;line-height:1.6;"><strong>Paid:</strong> ${amount} ${currency}</p>
    `,
  });

module.exports = purchaseTemplate;
