const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = require("./config/swagger");

const app = express();
const server = http.createServer(app);

const authRouter = require("./Routes/authRoute");
const locationRouter = require("./Routes/locationRoute");
const userRouter = require("./Routes/userRoute");
const propertyRouter = require("./Routes/propertyRoute");
const agentRouter = require("./Routes/agentRoute");
const messageRouter = require("./Routes/messageRoute");
const adminRouter = require("./Routes/adminRoutes");
const bookingRouter = require("./Routes/bookingRoute");
const { initializeSocket } = require("./socket/socket");
const { sendEmail } = require("./utils/email");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://real-estate-api-znjy.onrender.com/",
  "http://localhost:4200",
];

// ======================
// MIDDLEWARE
// ======================

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const swaggerSpec = swaggerJSDoc(swaggerDefinition);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerDefinition);
});

initializeSocket(server);

//==============================
// ROUTES
// =============================

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Real Estate API is running",
  });
});

app.get("/api/v1/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "agentdoe@mailinator.com",
      subject: "Brevo Test Email",
      html: `
        <h1>Hello!</h1>
        <p>This email was sent using Brevo and Node.js.</p>
      `,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/locations", locationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/agents", agentRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/bookings", bookingRouter);

// =================
// 404
// =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = server;
