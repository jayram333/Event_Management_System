const bcrypt = require("bcryptjs");
const Organizer = require("../models/Organizer");

// =====================================================
// GET ORGANIZER PROFILE
// =====================================================

const getOrganizerProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.user.id).select(
      "-password -emailOtp -emailOtpExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer profile fetched successfully",
      data: organizer,
    });
  } catch (error) {
    console.error("Get organizer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching organizer profile",
    });
  }
};

// =====================================================
// UPDATE ORGANIZER PROFILE
// =====================================================

const updateOrganizerProfile = async (req, res) => {
  try {
    const {
      fullName,
      organizationName,
      phone,
    } = req.body;

    const organizer = await Organizer.findById(req.user.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    if (fullName !== undefined) {
      organizer.fullName = fullName.trim();
    }

    if (organizationName !== undefined) {
      organizer.organizationName = organizationName.trim();
    }

    if (phone !== undefined) {
      organizer.phone = phone.trim();
    }

    await organizer.save();

    return res.status(200).json({
      success: true,
      message: "Organizer profile updated successfully",
      data: {
        id: organizer._id,
        fullName: organizer.fullName,
        organizationName: organizer.organizationName,
        email: organizer.email,
        phone: organizer.phone,
        role: organizer.role,
        isEmailVerified: organizer.isEmailVerified,
        isActive: organizer.isActive,
      },
    });
  } catch (error) {
    console.error("Update organizer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating organizer profile",
    });
  }
};

// =====================================================
// CHANGE ORGANIZER PASSWORD
// =====================================================

const changeOrganizerPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters",
      });
    }

    const organizer = await Organizer.findById(req.user.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      organizer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    organizer.password = await bcrypt.hash(newPassword, 12);

    await organizer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change organizer password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

module.exports = {
  getOrganizerProfile,
  updateOrganizerProfile,
  changeOrganizerPassword,
};