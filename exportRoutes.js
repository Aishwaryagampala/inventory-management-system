const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportControllers')

const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.get('/products/excel', authMiddleware, roleMiddleware(['admin']), exportController.exportProductsToExcel);
router.get('/products/pdf', authMiddleware, roleMiddleware(['admin']), exportController.exportProductsToPDF);
router.get('/logs/excel', authMiddleware, roleMiddleware(['admin']), exportController.exportLogsToExcel);
router.get('/logs/pdf', authMiddleware, roleMiddleware(['admin']), exportController.exportLogsToPDF);

module.exports = router;