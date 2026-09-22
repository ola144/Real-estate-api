const User = require("../Models/user");
const crypto = require("node:crypto");
const generateToken = require("../utils/generateToken");
const { verifyGoogleToken } = require("../utils/goggleAuth");
const { sendEmail } = require("../utils/email");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 60 * 60 * 1000,
};

// ================================
// REGISTER
// ================================

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Validate required fields

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Check existing user

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      role: role || "customer",
    });

    // Generate JWT

    const token = generateToken(user._id);

    // Store JWT in HTTP-only cookie

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account.",
    });
  }
};

// ===================================
// LOGIN
// ===================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Explicitly select password because our User model has select: false
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact admin.",
      });
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate token

    const token = generateToken(user._id);

    // Store token

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        role: user.role,
        licenseNumber: user.licenseNumber,
        experience: user.experience,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
};

// =================================
// LOGOUT
// =================================

exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// =======================================
// GET CURRENT USER
// ========================================

exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address,
      photo: req.user.photo,
      role: req.user.role,
      licenseNumber: req.user.licenseNumber,
      experience: req.user.experience,
      bio: req.user.bio,
    },
  });
};

// =========================
// CREATE PASSWORD
// =========================

exports.createPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,

        message: "Token, password and confirmation are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,

        message: "Passwords do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,

        message: "Password must be at least 8 characters.",
      });
    }

    // Hash received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find agent
    const agent = await User.findOne({
      passwordSetupToken: hashedToken,

      passwordSetupExpires: {
        $gt: new Date(),
      },
    }).select("+passwordSetupToken +passwordSetupExpires +password");

    if (!agent) {
      return res.status(400).json({
        success: false,

        message: "This password setup link is invalid or has expired.",
      });
    }

    // Set password
    agent.password = password;

    // Remove setup token
    agent.passwordSetupToken = null;
    agent.passwordSetupExpires = null;

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "Password created successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Create password error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to create password.",
    });
  }
};

// =========================
// FORGOT PASSWORD
// =========================

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const genericMessage =
      "If an account exists for that email, a reset link has been sent.";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetExpires",
    );

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your RealEstate password",
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
        <h2>Reset your password</h2>
        <p>Hello ${user.name},</p>
        <p>Use the button below to choose a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none;">Reset password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>`,
      text: `Reset your password: ${resetUrl}`,
    });

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to send reset instructions." });
  }
};

// =========================
// RESET PASSWORD
// =========================

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to reset password." });
  }
};

// =========================
// GOOGLE AUTH
// =========================

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await verifyGoogleToken(credential);

    const payload = ticket;

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    console.log("Google user:", {
      googleId,
      email,
      name,
      email_verified,
    });

    if (!email || !email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    // Find user using Google ID first
    let user = await User.findOne({
      googleId,
    });

    // If no Google account exists, check email
    if (!user) {
      user = await User.findOne({
        email: email.toLowerCase(),
      });
    }

    // Existing account
    if (user) {
      // Connect Google account to an existing account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.photo && picture) {
        user.photo = picture;
      }

      user.authProvider = "google";

      await user.save();
    }

    // Create new account
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        photo: picture || "",
        authProvider: "google",
      });
    }

    // IMPORTANT:
    // At this point user must exist
    if (!user?._id) {
      return res.status(500).json({
        success: false,
        message: "Unable to create or find Google user",
      });
    }

    console.log("Authenticated user:", user._id);

    // Generate your application's JWT
    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.profilePicture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
