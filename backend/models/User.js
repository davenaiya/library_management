const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },

  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  password: { 
    type: String, 
    required: true 
  },

  role: {
    type: String,
    enum: ["member", "librarian", "admin"],
    default: "member",
    index: true
  },

  isDeleted: { 
    type: Boolean, 
    default: false 
  },

  // 🔐 Password reset
  resetToken: String,
  resetTokenExpire: Date

}, { 
  timestamps: true 
});

module.exports = mongoose.model("User", userSchema);