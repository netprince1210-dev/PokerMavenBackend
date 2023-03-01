const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Login
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/avatars', authController.getAvatars);
module.exports = router;