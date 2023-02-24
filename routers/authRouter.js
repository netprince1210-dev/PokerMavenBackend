const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { AccountEmailVerify } = require('../middleware/verify');

// User Login
router.post('/user/login', authController.onUserLogin);
// User Register
router.post('/user/register', authController.onUserRegister);
// User Verify
router.get('/user/verify', AccountEmailVerify, authController.onUserVerify);
// User forgot password
router.get('/user/pwd/verify', authController.onUserPasswordVerify);
// User lost password
router.post('/user/lostpassword', authController.onLostPassword);

module.exports = router;