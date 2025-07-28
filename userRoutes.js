const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/add/user', authMiddleware, roleMiddleware(['admin']), userController.addUser)

module.exports = router