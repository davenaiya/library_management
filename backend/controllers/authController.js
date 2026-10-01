const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// ---------------- REGISTER (Member Only) ----------------
exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim().replace(/\s+/g, " ");
    const password = String(req.body.password || "");
    const email = String(req.body.email || "").trim().toLowerCase();

    const exist = await User.findOne({ email });
    if (exist && !exist.isDeleted) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    let user;

    if (exist && exist.isDeleted) {
      exist.name = name;
      exist.email = email;
      exist.password = hash;
      exist.role = "member";
      exist.isDeleted = false;
      exist.resetToken = undefined;
      exist.resetTokenExpire = undefined;
      user = await exist.save();
    } else {
      user = await User.create({ name, email, password: hash, role: "member" });
    }

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ msg: "Registration successful", user: userData });
  } catch (err) { next(err); }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return res.status(401).json({ msg: "Invalid email or password" });

    let match = false;

    if (user.password?.startsWith("$2")) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
      if (match) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!match) return res.status(401).json({ msg: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({ msg: "Login successful", token });
  } catch (err) { next(err); }
};

// ---------------- LOGOUT ----------------
exports.logout = async (req, res, next) => {
  try {
    res.json({ msg: "Logout successful. Please remove token from client" });
  } catch (err) { next(err); }
};

// ---------------- CURRENT USER ----------------
exports.me = async (req, res, next) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) { next(err); }
};

// ---------------- CHANGE PASSWORD ----------------
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = user.password?.startsWith("$2")
      ? await bcrypt.compare(oldPassword, user.password)
      : oldPassword === user.password;
    if (!match) return res.status(400).json({ msg: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) { next(err); }
};

// ---------------- FORGOT PASSWORD (OTP or Link) ----------------
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { type } = req.body;
    const user = await User.findOne({ email });

    // ✅ CHANGE 1: Always return 200 — never leak whether email exists via status code
    if (!user) {
      return res.status(200).json({ msg: "If email exists, reset instructions sent" });
    }

    if (type === "otp") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetToken = otp;
      user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      await sendEmail(user.email, "Your OTP for Password Reset", `Your OTP is: ${otp}`);
      return res.json({ msg: "OTP sent to email" });
    }

    if (type === "link") {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = token;
      user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      // ✅ CHANGE 2: Use CLIENT_URL from .env instead of hardcoded localhost
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
      await sendEmail(user.email, "Reset Your Password", `Click this link to reset password: ${resetLink}`);
      return res.json({ msg: "Reset link sent to email" });
    }

    return res.status(400).json({ msg: 'Please specify type: "otp" or "link"' });
  } catch (err) { next(err); }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : undefined;
    const { otpOrToken, newPassword } = req.body;
    const isOtp = /^\d{6}$/.test(String(otpOrToken));
    const query = {
      resetToken: otpOrToken,
      resetTokenExpire: { $gt: Date.now() }
    };

    if (isOtp) {
      query.email = email;
    }

    const user = await User.findOne(query);

    if (!user) return res.status(400).json({ msg: "OTP or reset link invalid/expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (err) { next(err); }
};
