const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const optionalAuth = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.userId);

    if (user?.isActive) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
};

module.exports = optionalAuth;
