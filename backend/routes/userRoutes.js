const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  validate,
  addUserSchema,
} = require("../middleware/validationMiddleware");

router.post(
  "/add/user",
  authMiddleware,
  roleMiddleware(["admin"]),
  validate(addUserSchema),
  userController.addUser
);

module.exports = router;
