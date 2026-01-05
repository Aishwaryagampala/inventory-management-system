const express = require("express");
const router = express.Router();
const logController = require("../controllers/logControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/all-logs",
  authMiddleware,
  roleMiddleware(["admin"]),
  logController.getAllLogs
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  logController.deleteLog
);

module.exports = router;
