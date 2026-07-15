const calculateHmac = require("../utils/paymobHmac");

const verifyPaymobHmac = (req, res, next) => {
  const receivedHmac = req.query.hmac;

  if (!receivedHmac) {
    return res.status(400).json({
      status: "fail",
      message: "Missing HMAC",
    });
  }

  const calculatedHmac = calculateHmac(req.body.obj);

  if (receivedHmac !== calculatedHmac) {
    return res.status(403).json({
      status: "fail",
      message: "Invalid HMAC",
    });
  }

  next();
};

module.exports = verifyPaymobHmac;
