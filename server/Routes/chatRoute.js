const express = require("express");
const router = express.Router();

const { createChat, findUserChats, findOneUserChat } = require("../Controllers/chatController");

router.post('/', createChat);
router.get('/:userId', findUserChats);
router.get('/find/:firstId/:secondId', findOneUserChat);


module.exports = router;