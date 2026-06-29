const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { auth } = require('../middleware/auth');

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.get('/profile', auth, AuthController.getProfile);

module.exports = router;
