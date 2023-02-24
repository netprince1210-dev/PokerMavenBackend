const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');
const { authUser } = require('../middleware/auth');

/**
 * New mail send
 */
router.post('/compose', authUser, mailController.compose);
/**
 * Mail inbox list
 */
router.get('/inbox', authUser, mailController.inbox);
/**
 * Mail sent list
 */
router.get('/sent', authUser, mailController.sent);
/**
 * Delete Mail
 */
router.put('/', authUser, mailController.update);
/**
 * Send invite
 */
router.post('/invite', authUser, mailController.invite);
/**
 * Pending invite
 */
router.get('/pending', authUser, mailController.pending);
/**
 * Resend invite
 */
router.post('/resend/invite', authUser, mailController.resendInvite);

module.exports = router;
