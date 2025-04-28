const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.post('/register/customer', AuthController.registerCustomer);
router.post('/login', AuthController.login);

module.exports = router;
