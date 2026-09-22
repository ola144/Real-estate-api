const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  createPassword,
  googleAuth,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/create-password", createPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

//Protected route
router.get("/me", protect, getMe);

module.exports = router;
