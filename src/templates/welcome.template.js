const baseTemplate = require("./base.template");

const welcomeTemplate = ({ firstName, role }) =>
  baseTemplate({
    title: "Welcome to CourseHub",
    preview: "Your CourseHub account is ready.",
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">Welcome, ${firstName}!</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Your CourseHub account has been created successfully.</p>
      <p style="margin:0;line-height:1.6;">Account role: <strong>${role}</strong></p>
    `,
  });

module.exports = welcomeTemplate;
