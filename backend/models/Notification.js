const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Organizer", "Admin"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      enum: ["User", "Organizer", "Admin"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    taskId: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "TASK_COMPLETED",
        "TASK_VERIFIED",
        "TASK_DELAYED",
        "TASK_TIMING_CHANGED",
        "JOIN_REQUEST",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
