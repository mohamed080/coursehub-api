const baseTemplate = require("./base.template");

const instructorEnrollmentTemplate = ({ instructorName, studentName, courseTitle }) =>
  baseTemplate({
    title: "New Course Enrollment",
    preview: `${studentName} enrolled in ${courseTitle}.`,
    content: `
      <h2 style="margin:0 0 12px;font-size:24px;">New enrollment</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Hi ${instructorName}, a new student enrolled in your course.</p>
      <p style="margin:0 0 8px;line-height:1.6;"><strong>Student:</strong> ${studentName}</p>
      <p style="margin:0;line-height:1.6;"><strong>Course:</strong> ${courseTitle}</p>
    `,
  });

module.exports = instructorEnrollmentTemplate;
