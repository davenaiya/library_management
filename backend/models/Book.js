const mongoose = require("mongoose");

// ✅ CHANGE 1: Added required, min, and trim validation at schema level
// Previously all fields were just plain types with no constraints (title: String, etc.)
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"]
  },
  available: {
    type: Number,
    min: [0, "Available count cannot be negative"]
  },
  image: {
    type: String,
    default: ""
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
