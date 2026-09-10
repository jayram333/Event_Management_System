const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
      default: null,
    },

    emailOtpExpires: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Email verification OTP
    verificationOtp: {
      type: String,
      default: null,
    },

    // OTP expires after 10 minutes
    verificationOtpExpires: {
      type: Date,
      default: null,
    },

    // Forgot password
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    resetPasswordOtp: {
      type: String,
      default: null,
    },

    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);