require("dotenv").config();

const app = require("./src/app");
const connectDatabase = require("./src/config/db");

const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();