const User = require("../models/User");
const Book = require("../models/Book");
const Issue = require("../models/Issue");
const { startOfDay } = require("../services/fineService");

// ---------------- ADMIN DASHBOARD ----------------
exports.getDashboard = async (req, res, next) => {
  try {
    // USERS
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalMembers = await User.countDocuments({ role: "member", isDeleted: false });
    const totalLibrarians = await User.countDocuments({ role: "librarian", isDeleted: false });

    // BOOKS
    const totalBooks = await Book.countDocuments({ isDeleted: false });

    // ISSUES
    const issuedBooks = await Issue.countDocuments({ status: "approved" });
    const returnedBooks = await Issue.countDocuments({ status: "returned" });

    const overdueBooks = await Issue.countDocuments({
      status: "approved",
      dueDate: { $lt: startOfDay(new Date()) }
    });

    // FINES
    const fineData = await Issue.aggregate([
      { $group: { _id: null, total: { $sum: "$fine" } } }
    ]);

    const totalFines = fineData.length > 0 ? fineData[0].total : 0;

    res.json({
      users: {
        totalUsers,
        totalMembers,
        totalLibrarians
      },
      books: {
        totalBooks
      },
      issues: {
        issuedBooks,
        returnedBooks,
        overdueBooks
      },
      fines: totalFines
    });

  } catch (err) {
    next(err);
  }
};
