const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/category-distribution",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  reportController.getCategoryDistribution
);
router.get(
  "/low-quantity",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  reportController.getlowQuantity
);
router.get(
  "/daily-activity",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  reportController.getDailyActivityLogs
);
router.get(
  "/top-selling-products",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  reportController.getTopSellingProducts
);

module.exports = router;
