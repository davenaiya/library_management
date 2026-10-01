const Issue = require("../models/Issue");
const Book = require("../models/Book");
const mongoose = require("mongoose");
const { calculateFine, startOfDay } = require("../services/fineService");

const serializeIssueWithFine = (issueDoc) => {
  const issue = issueDoc.toObject ? issueDoc.toObject() : issueDoc;
  const currentFine =
    issue.status === "returned"
      ? issue.fine || 0
      : calculateFine(issue.dueDate, new Date());

  return {
    ...issue,
    currentFine
  };
};

exports.getMyBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const query = {
      user: req.user._id,
      status: { $in: ["requested", "approved", "returned", "rejected"] }
    };

    const issues = await Issue.find(query)
      .populate("book")
      .populate("approvedBy", "name role")
      .populate("rejectedBy", "name role")
      .populate("returnedBy", "name role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Issue.countDocuments(query);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: issues.map(serializeIssueWithFine)
    });
  } catch (err) {
    next(err);
  }
};

exports.requestBook = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.body.bookId)) {
      return res.status(400).json({ msg: "A valid book ID is required" });
    }

    const book = await Book.findOne({ _id: req.body.bookId, isDeleted: false });

    if (!book || book.available <= 0) {
      return res.status(400).json({ msg: "Book not available" });
    }

    const already = await Issue.findOne({
      user: req.user._id,
      book: req.body.bookId,
      status: { $in: ["requested", "approved"] }
    });

    if (already) {
      return res.status(400).json({ msg: "Book already requested/issued" });
    }

    const issue = await Issue.create({
      user: req.user._id,
      book: book._id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ msg: "Book request sent", data: issue });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    if (issue.status !== "requested") {
      return res.status(400).json({ msg: "Only requested books can be approved" });
    }

    const reservation = await Book.updateOne(
      { _id: issue.book, isDeleted: false, available: { $gt: 0 } },
      { $inc: { available: -1 } }
    );
    if (reservation.modifiedCount !== 1) {
      return res.status(400).json({ msg: "No stock available" });
    }

    const approvedAt = new Date();
    const approvedIssue = await Issue.findOneAndUpdate(
      { _id: issue._id, status: "requested" },
      {
        $set: {
          status: "approved",
          approvedBy: req.user._id,
          approvedAt,
          issueDate: approvedAt,
          dueDate: new Date(approvedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          rejectedBy: null,
          rejectedAt: null
        }
      },
      { new: true }
    );

    if (!approvedIssue) {
      await Book.updateOne({ _id: issue.book }, { $inc: { available: 1 } });
      return res.status(409).json({ msg: "This request was already handled. Refresh the request list." });
    }

    res.json({ msg: "Book approved", data: approvedIssue });
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, status: "requested" },
      { $set: { status: "rejected", rejectedBy: req.user._id, rejectedAt: new Date() } },
      { new: true }
    );
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    res.json({ msg: "Book request rejected", data: issue });
  } catch (err) {
    next(err);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    if (issue.status !== "approved") {
      return res.status(400).json({ msg: "Book is not issued or already returned" });
    }

    if (req.user.role === "member" && issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not allowed to return this book" });
    }

    const returnedAt = new Date();
    const fine = calculateFine(issue.dueDate, returnedAt);
    const returnedIssue = await Issue.findOneAndUpdate(
      { _id: issue._id, status: "approved" },
      {
        $set: {
          returnDate: returnedAt,
          status: "returned",
          returnedBy: req.user._id,
          returnedAt,
          fine
        }
      },
      { new: true }
    );
    if (!returnedIssue) {
      return res.status(409).json({ msg: "This book was already returned. Refresh your books." });
    }

    await Book.updateOne({ _id: issue.book }, { $inc: { available: 1 } });
    res.json({ msg: "Book returned successfully", data: returnedIssue });
  } catch (err) {
    next(err);
  }
};

exports.getOverdue = async (req, res, next) => {
  try {
    const overdue = await Issue.find({
      status: "approved",
      dueDate: { $lt: startOfDay(new Date()) }
    }).populate("user book");

    res.json({ data: overdue.map(serializeIssueWithFine) });
  } catch (err) {
    next(err);
  }
};

exports.getFines = async (req, res, next) => {
  try {
    const fines = await Issue.find({
      $or: [
        { fine: { $gt: 0 } },
        {
          status: "approved",
          dueDate: { $lt: startOfDay(new Date()) }
        }
      ]
    })
      .populate("user book")
      .sort({ dueDate: 1 });

    const enriched = fines
      .map(serializeIssueWithFine)
      .sort((a, b) => (b.currentFine || 0) - (a.currentFine || 0));

    res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
};
