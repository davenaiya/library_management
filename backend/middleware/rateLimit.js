const rateLimit = require("express-rate-limit");

// Limit requests for forgot password to prevent spam
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { msg: "Too many password reset requests. Try again later." }
});

module.exports = { forgotPasswordLimiter };