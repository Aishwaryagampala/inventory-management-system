const express = require('express');
const router = express.Router();

const {login, logout, session} = require('../controllers/authControllers.js')
const authMiddleware = require('../middlewares/authMiddleware.js')

router.post('/login', login)
router.post('/logout', logout)
router.get('/session', session);

module.exports = router;