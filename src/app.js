const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const coursesRoutes = require("./routes/courses.routes");

const notFound = require("./middleware/notFound.middleware");
const globalErrorHandler = require("./middleware/error.middleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);

app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;