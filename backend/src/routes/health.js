const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const healthController = require('../controllers/healthController');

router.get('/', verifyToken, healthController.healthCheck);

module.exports = router;
