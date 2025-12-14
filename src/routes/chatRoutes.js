const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/users', chatController.getUsersWithChat);
router.get('/:userId', chatController.getMessages);

module.exports = router;
