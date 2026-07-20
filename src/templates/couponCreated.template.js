const baseTemplate = require("./base.template");

const couponCreatedTemplate = ({ adminName, code, type, value }) =>
  baseTemplate({
    title: "Coupon Created",
    preview: `Coupon ${code} has been created.`,
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Coupon created</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Hi ${adminName}, your coupon was created successfully.</p>
      <p style="margin:0 0 8px;line-height:1.6;"><strong>Code:</strong> ${code}</p>
      <p style="margin:0;line-height:1.6;"><strong>Discount:</strong> ${value} ${type}</p>
    `,
  });

module.exports = couponCreatedTemplate;
