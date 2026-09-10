const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "SUBMITTED_FOR_VERIFICATION",
        "COMPLETED",
        "VERIFIED",
        "DELAYED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    guidelines: {
      type: String,
      default: "",
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    numberOfCoordinators: {
      type: Number,
      required: true,
      min: 1,
    },

    eventPlace: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      address: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    // Users who have been approved as coordinators
    coordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Users who requested to join this event as coordinators
    joinRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED"],
          default: "PENDING",
        },

        requestedAt: {
          type: Date,
          default: Date.now,
        },

        respondedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    tasks: {
      type: [taskSchema],
      required: true,
      validate: {
        validator: function (tasks) {
          return tasks.length > 0;
        },
        message: "At least one task is required",
      },
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);