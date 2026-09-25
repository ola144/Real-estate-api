const { Server } = require("socket.io");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://real-estate-api-znjy.onrender.com",
  "https://realestateclientapplication.vercel.app",
  "http://localhost:4200",
];

exports.initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, origin);
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  console.log("Hello");

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joings their room
    socket.on("join-user", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined`);
    });

    // Join Conversation
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Typing
    socket.on("typing", ({ conversationId, userId }) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit("user-typing", { userId, conversationId });
    });

    // Stop typing
    socket.on("stop-typing", ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit("user-stop-typing", {
        userId,
        conversationId,
      });
    });

    // WebRTC signaling
    socket.on("call-user", ({ targetUserId, caller, callType, offer }) => {
      io.to(`user:${targetUserId}`).emit("incoming-call", {
        caller,
        callType,
        offer,
      });
    });

    socket.on("answer-call", ({ targetUserId, answer }) => {
      io.to(`user:${targetUserId}`).emit("call-answerd", { answer });
    });

    socket.on("ice-candidate", ({ targetUserId, candidate }) => {
      io.to(`user:${targetUserId}`).emit("ice-candidate", { candidate });
    });

    // End Call
    socket.on("end-call", ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit("call-ended");
    });

    // Reject call
    socket.on("reject-call", ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit("call-rejected");
    });

    // Disconnected
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

// exports.getIO = () => {
//   if (!io) {
//     throw new Error("Socket.IO has not been initiated.");
//   }

//   return io;
// };
