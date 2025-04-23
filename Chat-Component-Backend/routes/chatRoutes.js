const express = require('express');
const { toggleChat, addMessage, getMessages, streamUpdates } = require('../controllers/chatController');

const router = express.Router();

router.post('/toggle', toggleChat);
router.post('/message', addMessage);
router.get('/messages', getMessages);
router.get('/stream', streamUpdates);

module.exports = router;
