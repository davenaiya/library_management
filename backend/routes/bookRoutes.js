const router = require("express").Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");
const { validateBook } = require("../middleware/validate");
const book = require("../controllers/bookController");

router.get("/", book.getBooks);

router.get("/inventory", protect, authorize("librarian", "admin"), book.getInventory);
router.get("/low-stock", protect, authorize("librarian", "admin"), book.getLowStockBooks);

router.post(
  "/",
  protect,
  authorize("librarian", "admin"),
  upload.single("image"),
  validateBook,
  book.addBook
);

router.put(
  "/:id",
  protect,
  authorize("librarian", "admin"),
  upload.single("image"),
  validateBook,
  book.updateBook
);

router.delete("/:id", protect, authorize("librarian", "admin"), book.deleteBook);

module.exports = router;
