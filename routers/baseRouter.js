const express = require('express');
const router = express.Router();
const baseController = require('../controllers/baseController');
const { authUser } = require('../middleware/auth');


router.get('/categories', baseController.getCategories);
router.get('/subcategories/:cid', baseController.getSubCategories);
router.post('/download/:file', authUser, baseController.download);
router.get('/followers', authUser, baseController.getFollowers);

module.exports = router;