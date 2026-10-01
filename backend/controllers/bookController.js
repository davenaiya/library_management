const Book = require("../models/Book");
const Issue = require("../models/Issue");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.addBook = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      quantity,
      available: quantity,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    res.json({ msg: "Book added successfully", data: book });
  } catch (err) {
    next(err);
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    let query = { isDeleted: false };

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { author: { $regex: safe, $options: "i" } }
      ];
    }

    const books = await Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Book.countDocuments(query);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || book.isDeleted) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const updates = {};
    const allowed = ["title", "author", "quantity"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    if (updates.quantity != null) {
      const diff = Number(updates.quantity) - book.quantity;
      const issued = book.quantity - book.available;
      if (Number(updates.quantity) < issued) {
        return res.status(400).json({
          msg: `Quantity cannot be lower than ${issued} copies currently issued`
        });
      }
      updates.available = Math.max(0, book.available + diff);
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after"
    });

    res.json({
      msg: "Book updated successfully",
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || book.isDeleted) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const openIssue = await Issue.exists({
      book: book._id,
      status: { $in: ["requested", "approved"] }
    });
    if (openIssue) {
      return res.status(409).json({
        msg: "Resolve pending requests and return issued copies before removing this book"
      });
    }

    book.isDeleted = true;
    book.deletedAt = new Date();
    await book.save();

    res.json({ msg: "Book deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getLowStockBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      available: { $lte: 2 },
      isDeleted: false
    });

    res.json({
      msg: "Low stock books",
      count: books.length,
      data: books
    });
  } catch (err) {
    next(err);
  }
};

exports.getInventory = async (req, res, next) => {
  try {
    const books = await Book.find({ isDeleted: false });

    const inventory = books.map((book) => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      total: book.quantity,
      available: book.available,
      issued: book.quantity - book.available
    }));

    res.json({
      msg: "Inventory fetched successfully",
      count: inventory.length,
      data: inventory
    });
  } catch (err) {
    next(err);
  }
};
