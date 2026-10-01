

const router = require("express").Router();
const auth = require("../controllers/authController");
const protect = require("../middleware/protect");

const {
  validateRegister,
  validateLogin,
  validateResetPassword,
  validateChangePassword,
  validateForgotPassword
} = require("../middleware/validate");

const rateLimit = require("express-rate-limit");
const { forgotPasswordLimiter } = require("../middleware/rateLimit");

// 🔥 Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { msg: "Too many login attempts. Try later." }
});

// Routes
// Register (members only)
router.post("/register", validateRegister, auth.register);
router.post("/login", loginLimiter, validateLogin, auth.login);
router.post("/logout", protect, auth.logout);
router.get("/me", protect, auth.me);
router.put("/change-password", protect, validateChangePassword, auth.changePassword);
// Forgot password (OTP or link)
router.post("/forgot-password", forgotPasswordLimiter, validateForgotPassword, auth.forgotPassword);

router.post("/reset-password", validateResetPassword, auth.resetPassword);

module.exports = router;
