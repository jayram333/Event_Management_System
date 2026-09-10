const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");
const User = require("../models/User");
const Event = require("../models/Event");

// Admin login
const adminLogin = async (req, res) => {
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

    const admin = await Admin.findOne({
      email: normalizedEmail,
      role: "ADMIN",
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "ADMIN",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
    });
  }
};

// Get all organizers
const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find()
      .select(
        "-password -emailOtp -emailOtpExpires -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Organizers fetched successfully",
      count: organizers.length,
      data: organizers,
    });
  } catch (error) {
    console.error("Get all organizers error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching organizers",
    });
  }
};

// Get organizer by ID
const getOrganizerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }

    const organizer = await Organizer.findById(
      req.params.id
    ).select(
      "-password -emailOtp -emailOtpExpires -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      data: organizer,
    });
  } catch (error) {
    console.error("Get organizer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching organizer",
    });
  }
};

// Activate or deactivate organizer
const updateOrganizerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const organizer = await Organizer.findById(
      req.params.id
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    organizer.isActive = isActive;

    await organizer.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Organizer activated successfully"
        : "Organizer deactivated successfully",
      data: {
        id: organizer._id,
        fullName: organizer.fullName,
        email: organizer.email,
        isActive: organizer.isActive,
      },
    });
  } catch (error) {
    console.error("Update organizer status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating organizer status",
    });
  }
};

// Delete organizer
const deleteOrganizer = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }

    const organizer = await Organizer.findById(
      req.params.id
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    await Event.deleteMany({
      organizerId: organizer._id,
    });

    await Organizer.findByIdAndDelete(
      organizer._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Organizer and associated events deleted successfully",
    });
  } catch (error) {
    console.error("Delete organizer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting organizer",
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "-password -emailOtp -emailOtpExpires -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(
      req.params.id
    ).select(
      "-password -emailOtp -emailOtpExpires -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// Activate or deactivate user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "organizerId",
        select: "fullName organizationName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id name email phone",
      })
      .sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      message: "All events fetched successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get all events error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(
      req.params.id
    )
      .populate({
        path: "organizerId",
        select: "fullName organizationName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id name email phone",
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Get admin event error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  getAllOrganizers,
  getOrganizerById,
  updateOrganizerStatus,
  deleteOrganizer,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllEvents,
  getEventById,
};