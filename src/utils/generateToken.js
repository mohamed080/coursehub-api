const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: userId.toString(),
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    },
  );
};

const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: userId.toString(),
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  );
};

const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokens };
