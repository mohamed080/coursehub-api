const axios = require("axios");

const paymob = axios.create({
  baseURL: "https://accept.paymob.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const authenticate = async () => {
  const { data } = await paymob.post("/auth/tokens", {
    api_key: process.env.PAYMOB_API_KEY,
  });

  return data.token;
};

module.exports = {
  paymob,
  authenticate,
};
