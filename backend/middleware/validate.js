// Validate requests
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeName = (value) => String(value || "").trim().replace(/\s+/g, " ");

const isValidName = (value) => value.length >= 2 && value.length <= 60;
const isValidEmail = (value) => EMAIL_REGEX.test(value);
const isStrongPassword = (value) => PASSWORD_REGEX.test(value);

const passwordRuleMessage =
  "Password must be 8-64 characters and include uppercase, lowercase, number, and special character";

exports.validateRegister = (req, res, next) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name || !email || !password) return res.status(400).json({ msg: "Name, email, and password are required" });
  if (!isValidName(name)) return res.status(400).json({ msg: "Name must be between 2 and 60 characters" });
  if (!isValidEmail(email)) return res.status(400).json({ msg: "Enter a valid email address" });
  if (!isStrongPassword(password)) return res.status(400).json({ msg: passwordRuleMessage });

  req.body.name = name;
  req.body.email = email;
  next();
};

exports.validateLogin = (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) return res.status(400).json({ msg: "Email and password are required" });
  if (!isValidEmail(email)) return res.status(400).json({ msg: "Enter a valid email address" });

  req.body.email = email;
  next();
};

exports.validateChangePassword = (req, res, next) => {
  const oldPassword = String(req.body.oldPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!oldPassword || !newPassword) return res.status(400).json({ msg: "Old and new password are required" });
  if (oldPassword === newPassword) return res.status(400).json({ msg: "New password must be different from old password" });
  if (!isStrongPassword(newPassword)) return res.status(400).json({ msg: passwordRuleMessage });
  next();
};

exports.validateForgotPassword = (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const { type } = req.body;
  if (!email || !type) return res.status(400).json({ msg: "Email and type are required" });
  if (!isValidEmail(email)) return res.status(400).json({ msg: "Enter a valid email address" });
  if (!["otp", "link"].includes(type)) return res.status(400).json({ msg: 'Type must be "otp" or "link"' });
  req.body.email = email;
  next();
};

exports.validateResetPassword = (req, res, next) => {
  const email = req.body.email ? normalizeEmail(req.body.email) : undefined;
  const otpOrToken = String(req.body.otpOrToken || "").trim();
  const newPassword = String(req.body.newPassword || "");
  if (!otpOrToken || !newPassword) {
    return res.status(400).json({ msg: "Reset token/OTP and new password are required" });
  }

  const isOtp = /^\d{6}$/.test(otpOrToken);
  if (isOtp && !email) {
    return res.status(400).json({ msg: "Email is required when using OTP" });
  }
  if (isOtp && email && !isValidEmail(email)) {
    return res.status(400).json({ msg: "Enter a valid email address" });
  }

  if (!isStrongPassword(newPassword)) return res.status(400).json({ msg: passwordRuleMessage });

  req.body.email = email;
  req.body.otpOrToken = otpOrToken;
  next();
};

exports.validateBook = (req, res, next) => {
  const { title, author } = req.body;
  const quantity =
    req.body.quantity !== undefined && req.body.quantity !== null && req.body.quantity !== ""
      ? Number(req.body.quantity)
      : req.body.quantity;

  if (req.method === "POST") {
    if (typeof title !== "string" || !title.trim() || typeof author !== "string" || !author.trim() || quantity == null) {
      return res.status(400).json({ msg: "Title, author and quantity are required" });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ msg: "Quantity must be a whole number of zero or more" });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return res.status(400).json({ msg: "Title cannot be empty" });
    }

    if (author !== undefined && (typeof author !== "string" || author.trim() === "")) {
      return res.status(400).json({ msg: "Author cannot be empty" });
    }

    if (quantity !== undefined && quantity !== "") {
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ msg: "Quantity must be a whole number of zero or more" });
      }
    }
  }

  if (quantity !== undefined && quantity !== "") {
    req.body.quantity = quantity;
  }

  next();
};
