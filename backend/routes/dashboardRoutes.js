const router = require("express").Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

const dashboard = require("../controllers/dashboardController");

router.get(
  "/",
  protect,
  authorize("admin"),
  dashboard.getDashboard
);

module.exports = router;