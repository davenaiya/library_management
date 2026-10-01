const router = require("express").Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const issue = require("../controllers/issueController");

router.get("/my-books", protect, authorize("member"), issue.getMyBooks);
router.post("/", protect, authorize("member"), issue.requestBook);

router.put("/approve/:id", protect, authorize("librarian", "admin"), issue.approve);
router.put("/reject/:id", protect, authorize("librarian", "admin"), issue.reject);
router.put("/return/:id", protect, authorize("librarian", "admin"), issue.returnBook);

router.get("/overdue", protect, authorize("librarian", "admin"), issue.getOverdue);
router.get("/fines", protect, authorize("librarian", "admin"), issue.getFines);

module.exports = router;
