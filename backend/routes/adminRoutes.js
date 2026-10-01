const router = require("express").Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const { validateBook } = require("../middleware/validate");

const admin = require("../controllers/adminController");
const book = require("../controllers/bookController");

// CREATE USER (Admin + Librarian)
router.post(
  "/users",
  protect,
  authorize("admin", "librarian"),
  admin.createUser
);

router.get(
  "/inventory-summary",
  protect,
  authorize("admin", "librarian"),
  admin.getInventorySummary
);
router.get(
  "/issues",
  protect,
  authorize("admin", "librarian"),
  admin.getAllIssues
);
router.get(
  "/report/pdf",
  protect,
  authorize("admin"),
  admin.generatePdfReport
);

// BOOK MANAGEMENT (Admin + Librarian)
router.get(
  "/books",
  protect,
  authorize("admin", "librarian"),
  book.getBooks
);

router.post(
  "/books",
  protect,
  authorize("admin", "librarian"),
  validateBook,
  book.addBook
);

router.put(
  "/books/:id",
  protect,
  authorize("admin", "librarian"),
  validateBook,
  book.updateBook
);

router.delete(
  "/books/:id",
  protect,
  authorize("admin", "librarian"),
  book.deleteBook
);

// GET USERS (Search + Pagination)
router.get(
  "/users",
  protect,
  authorize("admin", "librarian"),
  admin.getUsers
);

// UPDATE USER (Admin + Librarian with restrictions)
router.put(
  "/users/:id",
  protect,
  authorize("admin", "librarian"),
  admin.updateUser
);

// DELETE USER (ONLY ADMIN)
router.delete(
  "/users/:id",
  protect,
  authorize("admin", "librarian"),
  admin.deleteUser
);

module.exports = router;
