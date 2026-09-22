const Conversation = require("../Models/conversation");
const Message = require("../Models/message");
const User = require("../Models/user");
const { getIO } = require("../socket/socket");

exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    const currentUserId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant is required.",
      });
    }

    if (currentUserId.toString() === participantId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself.",
      });
    }

    const participant = await User.findById(participantId);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, participantId],
      },
      $expr: {
        $eq: [
          {
            $size: "$participants",
          },
          2,
        ],
      },
    });

    // Create if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, participantId],
      });
    }

    await conversation.populate("participants", "name email photo role");

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation.",
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email photo role")
      .populate("lastMessage", "content sender receiver isRead createdAt")
      .sort({
        lastMessageAt: -1,
        updatedAt: -1,
      });

    const formatted = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          receiver: userId,
          isRead: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, content } = req.body;

    const senderId = req.user._id;

    if (!conversationId || !receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation, receiver and content are required.",
      });
    }

    // Verify conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: {
        $all: [senderId, receiverId],
      },
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation.",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false,
    });

    // Update conversation
    conversation.lastMessage = message._id;

    conversation.lastMessageAt = new Date();

    await conversation.save();

    const io = getIO();
    io.to(receiverId.toString()).emit("new-message", message);

    // io.to(senderId.toString()).emit("message-sent", message);

    await message.populate("sender", "name email photo role");

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,

      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation.",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name email photo role")
      .populate("receiver", "name email photo role")
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,

      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,

          readAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read.",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read.",
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,

      isRead: false,
    });

    return res.status(200).json({
      success: true,

      unreadCount,
    });
  } catch (error) {
    console.error("Unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread messages.",
    });
  }
};
