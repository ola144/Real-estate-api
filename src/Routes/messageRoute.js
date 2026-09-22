const express = require("express");

const {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
} = require("../Controllers/messageController.js");

const protect = require("../Middleware/authMiddleware.js");

const router = express.Router();

// Conversations

router.post("/conversations", protect, createConversation);

router.get("/conversations", protect, getConversations);

// Messages
router.post("/", protect, sendMessage);

router.get("/conversations/:conversationId", protect, getMessages);

// Read/unread
router.patch(
  "/conversations/:conversationId/read",
  protect,
  markMessagesAsRead,
);

router.get("/unread-count", protect, getUnreadCount);

module.exports = router;
