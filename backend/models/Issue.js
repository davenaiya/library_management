const mongoose = require("mongoose");

// ✅ CHANGE 1: Added required: true on user, book, issueDate, dueDate
// Previously these had no constraints — a bug could create an Issue with no user or book
const issueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: [true, "Book is required"]
  },
  status: {
    type: String,
    enum: ["requested", "approved", "returned", "rejected"],
    default: "requested"
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  returnedAt: {
    type: Date,
    default: null
  },
  issueDate: {
    type: Date,
    required: [true, "Issue date is required"]
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"]
  },
  returnDate: Date,
  fine: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);
