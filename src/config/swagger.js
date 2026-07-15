const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.PORT || 3001;

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "CourseHub API",
      version: "1.0.0",
      description:
        "RESTful API for an online learning platform built with Node.js, Express.js, MongoDB, JWT, and Cloudinary.",
      contact: {
        name: "Mohamed Ayman",
      },
    },

    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${port}`,
        description: "Development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "User registration and login",
      },
      {
        name: "Users",
        description: "User profile and admin management",
      },
      {
        name: "Categories",
        description: "Course category management",
      },
      {
        name: "Courses",
        description: "Course management",
      },
      {
        name: "Course Gallery",
        description: "Course gallery image management",
      },
      {
        name: "Enrollments",
        description: "Course enrollment management",
      },
      {
        name: "Reviews",
        description: "Course reviews and ratings",
      },
      {
        name: "Wishlist",
        description: "Personal course wishlist",
      },
      {
        name: "Sections",
        description: "Course section management",
      },
      {
        name: "Lessons",
        description: "Lesson and video management",
      },
      {
        name: "Progress",
        description: "Student learning progress",
      },
      {
        name: "Certificates",
        description: "Course completion certificates",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the JWT access token returned from login.",
        },
      },
    },
  },

  /*
   * swagger-jsdoc scans these route files
   * for @openapi documentation blocks.
   */
  apis: ["./src/docs/*.js"],
};

const swaggerSpecification = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpecification;
