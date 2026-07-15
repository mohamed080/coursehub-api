const swaggerUi = require("swagger-ui-express");

const swaggerSpecification = require("../config/swagger");

const swaggerUiOptions = {
  customSiteTitle: "CourseHub API Documentation",

  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

const setupSwagger = (app) => {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecification, swaggerUiOptions),
  );

  /*
   * Raw OpenAPI specification.
   */
  app.get("/api/docs.json", (req, res) => {
    res.status(200).json(swaggerSpecification);
  });
};

module.exports = setupSwagger;
