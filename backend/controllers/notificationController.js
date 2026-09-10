const Notification = require("../models/Notification");

// Get notifications for logged-in user or organizer
const getNotifications = async (req, res) => {
  try {
    const recipientId = req.user.id;
    const recipientModel = req.user.role === "ORGANIZER" ? "Organizer" : req.user.role === "ADMIN" ? "Admin" : "User";

    const notifications = await Notification.find({
      recipient: recipientId,
      recipientModel: recipientModel,
    })
      .populate({
        path: "event",
        select: "eventName eventDate startTime endTime",
      })
      .populate({
        path: "sender",
        select: "fullName organizationName email name",
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: recipientId,
      recipientModel: recipientModel,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const recipientModel = req.user.role === "ORGANIZER" ? "Organizer" : req.user.role === "ADMIN" ? "Admin" : "User";

    await Notification.updateMany(
      { recipient: req.user.id, recipientModel: recipientModel, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notifications",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
