const express = require('express');
const router = express.Router();
const logController = require('../controllers/logControllers')

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/all-logs', authMiddleware, roleMiddleware(['admin']), logController.getAllLogs)

module.exports = router