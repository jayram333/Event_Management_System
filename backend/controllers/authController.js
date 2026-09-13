const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");
const User = require("../models/User");

const { generateOtp } = require("../utils/otp");
const { sendOtpEmail, sendPasswordResetOtpEmail } = require("../services/emailService");

// =====================================================
// ORGANIZER REGISTRATION
// =====================================================

const registerOrganizer = async (req, res) => {
  try {
    const {
      fullName,
      organizationName,
      email,
      phone,
      password,
      confirmPassword,
      termsAccepted,
    } = req.body;

    if (
      !fullName ||
      !organizationName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Conditions",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingOrganizer = await Organizer.findOne({
      email: normalizedEmail,
    });

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingOrganizer || existingUser || existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = generateOtp();

    const emailOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const organizer = await Organizer.create({
      fullName: fullName.trim(),
      organizationName: organizationName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      termsAccepted: true,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpires,
      isActive: true,
    });

    try {
      await sendOtpEmail(
        organizer.email,
        organizer.fullName,
        otp
      );
    } catch (emailError) {
      await Organizer.findByIdAndDelete(organizer._id);

      console.error(
        "Verification OTP email error:",
        emailError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Registration failed because verification OTP could not be sent",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Organizer registered successfully. OTP sent to your email.",
      data: {
        id: organizer._id,
        fullName: organizer.fullName,
        organizationName: organizer.organizationName,
        email: organizer.email,
        isEmailVerified: organizer.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Organizer registration error:", error.message, error.stack || error);

    return res.status(500).json({
      success: false,
      message: "Server error during organizer registration",
    });
  }
};

// =====================================================
// USER REGISTRATION
// =====================================================

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      termsAccepted,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Conditions",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    const existingOrganizer = await Organizer.findOne({
      email: normalizedEmail,
    });

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingUser || existingOrganizer || existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = generateOtp();

    const emailOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      termsAccepted: true,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpires,
      isActive: true,
    });

    try {
      await sendOtpEmail(
        user.email,
        user.fullName,
        otp
      );
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);

      console.error(
        "Verification OTP email error:",
        emailError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Registration failed because verification OTP could not be sent",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. OTP sent to your email.",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("User registration error:", error.message, error.stack || error);

    return res.status(500).json({
      success: false,
      message: "Server error during user registration",
    });
  }
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and role are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let account;

    if (role === "ORGANIZER") {
      account = await Organizer.findOne({
        email: normalizedEmail,
      });
    } else if (role === "USER") {
      account = await User.findOne({
        email: normalizedEmail,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Use ORGANIZER or USER",
      });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (account.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!account.emailOtp || !account.emailOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (new Date() > account.emailOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    if (String(account.emailOtp) !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    account.isEmailVerified = true;
    account.emailOtp = null;
    account.emailOtpExpires = null;

    await account.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Email OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

// =====================================================
// ORGANIZER LOGIN
// =====================================================

const loginOrganizer = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection is initializing. Please try again in a few seconds.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const organizer = await Organizer.findOne({
      email: normalizedEmail,
    });

    if (!organizer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!organizer.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    if (!organizer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your organizer account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      organizer.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: organizer._id,
        role: "ORGANIZER",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Organizer login successful",
      token,
      data: {
        id: organizer._id,
        fullName: organizer.fullName,
        organizationName: organizer.organizationName,
        email: organizer.email,
        role: organizer.role,
      },
    });
  } catch (error) {
    console.error("Organizer login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during organizer login",
    });
  }
};

// =====================================================
// USER LOGIN
// =====================================================

const loginUser = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection is initializing. Please try again in a few seconds.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your user account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: "USER",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "User login successful",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during user login",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - REQUEST OTP
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let account;
    let accountName = "User";

    if (role === "ORGANIZER") {
      account = await Organizer.findOne({ email: normalizedEmail });
      accountName = account ? account.fullName : "";
    } else if (role === "ADMIN") {
      account = await Admin.findOne({ email: normalizedEmail });
      accountName = account ? account.name : "";
    } else {
      account = await User.findOne({ email: normalizedEmail });
      accountName = account ? account.fullName : "";
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Account not found for email ${email} with role ${role}`,
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    account.resetPasswordOtp = otp;
    account.resetPasswordOtpExpires = otpExpires;
    await account.save();

    try {
      await sendPasswordResetOtpEmail(account.email, accountName || "User", otp);
    } catch (emailError) {
      console.error("Password reset OTP email error:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Unable to send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - VERIFY OTP
// =====================================================

const verifyResetOtp = async (req, res) => {
  try {
    const { email, role, otp } = req.body;

    if (!email || !role || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, role, and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let account;

    if (role === "ORGANIZER") {
      account = await Organizer.findOne({ email: normalizedEmail });
    } else if (role === "ADMIN") {
      account = await Admin.findOne({ email: normalizedEmail });
    } else {
      account = await User.findOne({ email: normalizedEmail });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (!account.resetPasswordOtp || !account.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new OTP",
      });
    }

    if (new Date() > account.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (String(account.resetPasswordOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Please enter your new password.",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { email, role, otp, newPassword } = req.body;

    if (!email || !role || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let account;

    if (role === "ORGANIZER") {
      account = await Organizer.findOne({ email: normalizedEmail });
    } else if (role === "ADMIN") {
      account = await Admin.findOne({ email: normalizedEmail });
    } else {
      account = await User.findOne({ email: normalizedEmail });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (!account.resetPasswordOtp || !account.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No active password reset session. Please request a new OTP",
      });
    }

    if (new Date() > account.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (String(account.resetPasswordOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    account.password = hashedPassword;
    account.resetPasswordOtp = null;
    account.resetPasswordOtpExpires = null;
    account.resetPasswordToken = null;
    account.resetPasswordExpires = null;

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

module.exports = {
  registerOrganizer,
  registerUser,
  verifyEmailOtp,
  loginOrganizer,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};