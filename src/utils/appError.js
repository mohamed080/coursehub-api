class AppError extends Error {
  constructor(message, statusCode, statusText, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.data = data;
  }
}

module.exports = AppError;
