const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/token-login', authController.tokenLogin);

module.exports = router;
