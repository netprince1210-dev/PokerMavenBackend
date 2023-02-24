const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authUser } = require('../middleware/auth');

router.put('/edit', authUser, profileController.edit);
router.get('/', authUser, profileController.get);
router.put('/avatar', authUser, profileController.avatar);
router.get('/activity/:userid', authUser, profileController.activity);
router.post('/post', authUser, profileController.post);
router.get('/header/:userid', authUser, profileController.getHeaderInfo);
router.post('/follow/:userid', authUser, profileController.follow);
router.get('/followers/:userid', authUser, profileController.followers);
router.delete('/follow/:followid', authUser, profileController.unFollow);
router.get('/shootout/:userid', authUser, profileController.shootOut);
router.put('/like/:postid', authUser, profileController.like);
router.get('/image/all/:userid', authUser, profileController.viewAllImage);

module.exports = router;
