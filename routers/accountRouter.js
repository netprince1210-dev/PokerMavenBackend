const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');


router.get('/all', accountController.getAccounts)
module.exports = router;