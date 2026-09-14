const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Admin = require("../models/Admin");

// Helper to retrieve event with ADMIN / ORGANIZER authorization checks
const findEventForManagement = async (eventId, user, populateOptions = null) => {
  let query = user.role === "ADMIN" ? Event.findById(eventId) : Event.findOne({ _id: eventId, organizerId: user.id });
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  return await query;
};

// =====================================================
// AUTOMATIC EVENT & TASK STATUS SYNC
// =====================================================

const syncEventStatuses = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const now = new Date();
    const events = await Event.find({ status: { $ne: "CANCELLED" } });

    for (const event of events) {
      if (!event.eventDate) continue;

      const eventDateStr = new Date(event.eventDate).toISOString().split("T")[0];
      const startMin = parseTime(event.startTime);
      const endMin = parseTime(event.endTime);

      if (startMin !== null && endMin !== null) {
        const eventStart = new Date(`${eventDateStr}T00:00:00`);
        eventStart.setMinutes(startMin);

        const eventEnd = new Date(`${eventDateStr}T00:00:00`);
        eventEnd.setMinutes(endMin);

        let newStatus = event.status;

        if (now > eventEnd) {
          newStatus = "COMPLETED";
        } else if (now >= eventStart && now <= eventEnd && event.status !== "DRAFT") {
          newStatus = "ONGOING";
        } else if (now < eventStart && event.status !== "DRAFT") {
          newStatus = "UPCOMING";
        }

        if (newStatus !== event.status) {
          event.status = newStatus;
          await event.save();
        }
      }

      // Check delayed tasks in active events
      if (event.status !== "COMPLETED") {
        let eventModified = false;
        for (const task of event.tasks) {
          if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
            const taskEndMin = parseTime(task.endTime);
            if (taskEndMin !== null) {
              const taskEnd = new Date(`${eventDateStr}T00:00:00`);
              taskEnd.setMinutes(taskEndMin);

              if (now > taskEnd) {
                task.status = "DELAYED";
                eventModified = true;

                // Send notification to organizer
                const existingNotif = await Notification.findOne({
                  event: event._id,
                  taskId: task._id.toString(),
                  type: "TASK_DELAYED",
                });

                if (!existingNotif) {
                  await Notification.create({
                    recipient: event.organizerId,
                    recipientModel: "Organizer",
                    event: event._id,
                    taskId: task._id.toString(),
                    type: "TASK_DELAYED",
                    message: `Task delayed: "${task.taskName}" in "${event.eventName}" was scheduled to end at ${task.endTime} and requires attention.`,
                  });
                }
              }
            }
          }
        }
        if (eventModified) {
          await event.save();
        }
      }
    }
  } catch (err) {
    console.error("Error in syncEventStatuses:", err.message);
  }
};

// =====================================================
// TIME HELPERS
// =====================================================

// Convert "09:00 AM" / "6:00 PM" to minutes from midnight
const parseTime = (timeString) => {
  if (typeof timeString !== "string") {
    return null;
  }

  const match = timeString
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return hour * 60 + minute;
};

// Convert minutes to "HH:MM AM/PM"
const formatTime = (totalMinutes) => {
  totalMinutes = Math.round(totalMinutes);

  let hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour -= 12;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

// =====================================================
// CREATE EVENT
// =====================================================

const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      numberOfCoordinators,
      eventPlace,
      tasks,
    } = req.body;

    if (
      !eventName ||
      !eventDate ||
      !startTime ||
      !endTime ||
      numberOfCoordinators === undefined ||
      !eventPlace ||
      !tasks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event name, date, start time, end time, number of coordinators, event place and tasks are required",
      });
    }

    // Validate coordinators
    if (
      !Number.isInteger(Number(numberOfCoordinators)) ||
      Number(numberOfCoordinators) < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of coordinators must be at least 1",
      });
    }

    // Validate tasks
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one task is required",
      });
    }

    // Parse event time
    const eventStartMinutes = parseTime(startTime);
    const eventEndMinutes = parseTime(endTime);

    if (
      eventStartMinutes === null ||
      eventEndMinutes === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start time and end time must be in format HH:MM AM/PM. Example: 09:00 AM",
      });
    }

    if (eventEndMinutes <= eventStartMinutes) {
      return res.status(400).json({
        success: false,
        message:
          "Event end time must be after start time",
      });
    }

    const totalEventMinutes =
      eventEndMinutes - eventStartMinutes;

    let currentTime = eventStartMinutes;
    let totalTaskMinutes = 0;
    let maxTaskEndMinutes = eventEndMinutes;

    const formattedTasks = [];

    // =====================================================
    // FORMAT TASKS
    // =====================================================

    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];

      if (
        !task ||
        typeof task.taskName !== "string" ||
        !task.taskName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Task ${index + 1} must have a valid taskName`,
        });
      }

      const duration = Number(task.duration);

      if (
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Task ${index + 1} (${task.taskName}) must have a valid duration in minutes`,
        });
      }

      if (!Number.isInteger(duration)) {
        return res.status(400).json({
          success: false,
          message:
            `Task ${index + 1} (${task.taskName}) duration must be in whole minutes`,
        });
      }

      const taskStartMinutes = currentTime;
      const taskEndMinutes = currentTime + duration;

      if (taskEndMinutes > maxTaskEndMinutes) {
        maxTaskEndMinutes = taskEndMinutes;
      }

      formattedTasks.push({
        taskName: task.taskName.trim(),

        duration,

        description:
          typeof task.description === "string"
            ? task.description.trim()
            : "",

        startTime:
          formatTime(taskStartMinutes),

        endTime:
          formatTime(taskEndMinutes),

        // Coordinator is assigned separately
        coordinator: null,

        priority:
          task.priority || "MEDIUM",

        status:
          task.status || "PENDING",

        guidelines:
          typeof task.guidelines === "string"
            ? task.guidelines.trim()
            : "",

        remarks:
          typeof task.remarks === "string"
            ? task.remarks.trim()
            : "",

        progress:
          typeof task.progress === "number"
            ? task.progress
            : 0,
      });

      currentTime = taskEndMinutes;
      totalTaskMinutes += duration;
    }

    const remainingMinutes =
      totalEventMinutes - totalTaskMinutes;

    // =====================================================
    // CREATE EVENT
    // =====================================================

    const finalEndTime =
      maxTaskEndMinutes > eventEndMinutes
        ? formatTime(maxTaskEndMinutes)
        : endTime.trim();

    const event = await Event.create({
      eventName: eventName.trim(),
      eventDate,
      startTime: startTime.trim(),
      endTime: finalEndTime,
      numberOfCoordinators:
        Number(numberOfCoordinators),
      eventPlace: eventPlace.trim(),
      tasks: formattedTasks,
      organizerId: req.user.id,
      status: "DRAFT",
    });

    try {
      const admins = await Admin.find({ isActive: true });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          recipientModel: "Admin",
          sender: req.user.id,
          senderModel: "Organizer",
          event: event._id,
          type: "JOIN_REQUEST",
          message: `New event created: "${event.eventName}" by organizer.`,
        });
      }
    } catch (notifErr) {
      console.error("Admin notification error on event create:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Event created successfully",

      schedule: {
        eventStartTime:
          formatTime(eventStartMinutes),

        eventEndTime:
          formatTime(eventEndMinutes),

        totalEventDuration:
          `${totalEventMinutes} minutes`,

        totalTaskDuration:
          `${totalTaskMinutes} minutes`,

        remainingTime:
          `${remainingMinutes} minutes`,

        remainingTimeFormatted:
          `${Math.floor(
            remainingMinutes / 60
          )} hours ${remainingMinutes % 60
          } minutes`,
      },

      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating event",
    });
  }
};

// =====================================================
// GET ORGANIZER EVENTS
// =====================================================

const getOrganizerEvents = async (req, res) => {
  try {
    await syncEventStatuses();
    const filter = req.user.role === "ADMIN" ? {} : { organizerId: req.user.id };
    const events = await Event.find(filter)
      .populate({
        path: "coordinators",
        select: "_id fullName email phone",
      })
      .populate({
        path: "joinRequests.user",
        select: "_id fullName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id fullName email phone",
      })
      .sort({
        eventDate: 1,
      });

    return res.status(200).json({
      success: true,
      message:
        "Organizer events fetched successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(
      "Get organizer events error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching events",
    });
  }
};

// =====================================================
// GET EVENT BY ID
// =====================================================

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: "organizerId",
        select: "_id fullName organizationName email",
      })
      .populate({
        path: "coordinators",
        select: "_id fullName email phone",
      })
      .populate({
        path: "joinRequests.user",
        select: "_id fullName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id fullName email phone",
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
    console.error(
      "Get event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching event",
    });
  }
};

// =====================================================
// GET UPCOMING EVENTS
// =====================================================

const getUpcomingEvents = async (req, res) => {
  try {
    await syncEventStatuses();
    const events = await Event.find({
      status: "UPCOMING",
    })
      .populate({
        path: "organizerId",
        select: "_id fullName organizationName email",
      })
      .populate({
        path: "coordinators",
        select: "_id fullName email phone",
      })
      .sort({
        eventDate: 1,
      });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching upcoming events",
    });
  }
};

// =====================================================
// GET JOINED EVENTS
// =====================================================

const getJoinedEvents = async (req, res) => {
  try {
    await syncEventStatuses();
    const events = await Event.find({
      coordinators: req.user.id,
    })
      .populate({
        path: "organizerId",
        select: "_id fullName organizationName email",
      })
      .populate({
        path: "coordinators",
        select: "_id fullName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id fullName email phone",
      })
      .sort({
        eventDate: 1,
      });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get joined events error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching joined events",
    });
  }
};

// =====================================================
// GET EVENT COORDINATORS (JOINED USERS)
// =====================================================

const getEventCoordinators = async (req, res) => {
  try {
    const event = await findEventForManagement(req.params.id, req.user, {
      path: "coordinators",
      select: "_id fullName email phone isEmailVerified",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const verifiedCoordinators = (event.coordinators || []).filter(
      (u) => u && u.isEmailVerified === true
    );

    return res.status(200).json({
      success: true,
      count: verifiedCoordinators.length,
      data: verifiedCoordinators,
    });
  } catch (error) {
    console.error("Get event coordinators error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching event users",
    });
  }
};

// =====================================================
// USER SENDS JOIN REQUEST
// =====================================================

const sendJoinRequest = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "UPCOMING") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming events can be joined",
      });
    }

    const alreadyCoordinator = event.coordinators.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyCoordinator) {
      return res.status(400).json({
        success: false,
        message: "You are already a coordinator for this event",
      });
    }

    const existingRequest = event.joinRequests.find(
      (request) =>
        request.user.toString() === userId.toString()
    );

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Your join request is already pending",
        });
      }

      if (existingRequest.status === "APPROVED") {
        return res.status(400).json({
          success: false,
          message: "You are already approved for this event",
        });
      }

      // Allow rejected users to request again
      existingRequest.status = "PENDING";
      existingRequest.requestedAt = new Date();
      existingRequest.respondedAt = null;

      await event.save();

      return res.status(201).json({
        success: true,
        message: "Join request sent successfully",
        data: existingRequest,
      });
    }

    if (
      event.coordinators.length >=
      event.numberOfCoordinators
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordinator limit is full",
      });
    }

    event.joinRequests.push({
      user: userId,
      status: "PENDING",
      requestedAt: new Date(),
      respondedAt: null,
    });

    await event.save();

    try {
      const applicant = await User.findById(userId);
      const applicantName = applicant ? applicant.fullName : "A user";
      await Notification.create({
        recipient: event.organizerId,
        recipientModel: "Organizer",
        sender: userId,
        senderModel: "User",
        event: event._id,
        type: "JOIN_REQUEST",
        message: `${applicantName} submitted a join request for event "${event.eventName}".`,
      });
    } catch (notifErr) {
      console.error("Notification error on send join request:", notifErr);
    }

    const newRequest =
      event.joinRequests[event.joinRequests.length - 1];

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Send join request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while sending join request",
    });
  }
};

// =====================================================
// ORGANIZER GETS JOIN REQUESTS
// =====================================================

const getJoinRequests = async (req, res) => {
  try {
    const event = await findEventForManagement(req.params.id, req.user, {
      path: "joinRequests.user",
      select: "_id fullName email phone",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: event.joinRequests.length,
      data: event.joinRequests,
    });
  } catch (error) {
    console.error("Get join requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching join requests",
    });
  }
};

// =====================================================
// ORGANIZER APPROVES JOIN REQUEST
// =====================================================

const approveJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const event = await findEventForManagement(id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const request = event.joinRequests.find(
      (item) =>
        item.user.toString() === userId.toString()
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}`,
      });
    }

    if (
      event.coordinators.length >=
      event.numberOfCoordinators
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordinator limit is full",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified !== true) {
      return res.status(400).json({
        success: false,
        message: "Only email-verified users can be approved as event coordinators",
      });
    }

    event.coordinators.push(userId);

    request.status = "APPROVED";
    request.respondedAt = new Date();

    await event.save();

    try {
      await Notification.create({
        recipient: userId,
        recipientModel: "User",
        sender: req.user.id,
        senderModel: req.user.role === "ADMIN" ? "Admin" : "Organizer",
        event: event._id,
        type: "JOIN_REQUEST",
        message: `Your join request for event "${event.eventName}" has been approved!`,
      });
    } catch (notifErr) {
      console.error("Notification error on approve join request:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Join request approved successfully",
      data: {
        request,
        coordinator: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Approve join request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while approving join request",
    });
  }
};

// =====================================================
// ORGANIZER REJECTS JOIN REQUEST
// =====================================================

const rejectJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const event = await findEventForManagement(id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const request = event.joinRequests.find(
      (item) =>
        item.user.toString() === userId.toString()
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}`,
      });
    }

    request.status = "REJECTED";
    request.respondedAt = new Date();

    await event.save();

    try {
      await Notification.create({
        recipient: userId,
        recipientModel: "User",
        sender: req.user.id,
        senderModel: req.user.role === "ADMIN" ? "Admin" : "Organizer",
        event: event._id,
        type: "JOIN_REQUEST",
        message: `Your join request for event "${event.eventName}" was rejected.`,
      });
    } catch (notifErr) {
      console.error("Notification error on reject join request:", notifErr);
    }

    request.status = "REJECTED";
    request.respondedAt = new Date();

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("Reject join request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting join request",
    });
  }
};

// =====================================================
// USER GETS THEIR JOIN REQUEST STATUS
// =====================================================

const getMyJoinRequest = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const request = event.joinRequests.find(
      (item) =>
        item.user.toString() === req.user.id.toString()
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No join request found",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get my join request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching join request",
    });
  }
};

// =====================================================
// USER LEAVES EVENT
// =====================================================

const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const userId = req.user.id;

    const joined = event.coordinators.some(
      (id) => id.toString() === userId.toString()
    );

    if (!joined) {
      return res.status(400).json({
        success: false,
        message: "You have not joined this event",
      });
    }

    event.coordinators = event.coordinators.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Remove the user from any assigned tasks
    event.tasks.forEach((task) => {
      if (
        task.coordinator &&
        task.coordinator.toString() === userId.toString()
      ) {
        task.coordinator = null;
      }
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: "You left the event successfully",
      data: event,
    });
  } catch (error) {
    console.error("Leave event error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while leaving event",
    });
  }
};

// =====================================================
// UPDATE SINGLE TASK
// =====================================================

const updateTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    const event = await findEventForManagement(id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const task = event.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found in this event",
      });
    }

    const {
      taskName,
      duration,
      description,
      coordinator,
      priority,
      status,
      guidelines,
      remarks,
      progress,
    } = req.body;

    // Update task name
    if (taskName !== undefined) {
      if (
        typeof taskName !== "string" ||
        !taskName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Task name cannot be empty",
        });
      }

      task.taskName = taskName.trim();
    }

    // Update duration
    if (duration !== undefined) {
      const newDuration = Number(duration);

      if (
        !Number.isInteger(newDuration) ||
        newDuration <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Task duration must be a positive whole number of minutes",
        });
      }

      task.duration = newDuration;
    }

    if (description !== undefined) {
      task.description = description;
    }

    // Update coordinator
    if (coordinator !== undefined) {
      if (coordinator === null || coordinator === "") {
        task.coordinator = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(coordinator)) {
          return res.status(400).json({
            success: false,
            message: "Invalid coordinator user ID",
          });
        }

        const isApprovedCoordinator =
          event.coordinators.some(
            (userId) =>
              userId.toString() === coordinator.toString()
          );

        if (!isApprovedCoordinator) {
          return res.status(400).json({
            success: false,
            message:
              "User must be an approved coordinator for this event",
          });
        }

        task.coordinator = coordinator;
      }
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (guidelines !== undefined) {
      task.guidelines = guidelines;
    }

    if (remarks !== undefined) {
      task.remarks = remarks;
    }

    if (progress !== undefined) {
      const newProgress = Number(progress);

      if (
        !Number.isFinite(newProgress) ||
        newProgress < 0 ||
        newProgress > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Progress must be between 0 and 100",
        });
      }

      task.progress = newProgress;
    }

    // =====================================================
    // RECALCULATE TASK TIMINGS
    // =====================================================

    const eventStartMinutes =
      parseTime(event.startTime);

    const eventEndMinutes =
      parseTime(event.endTime);

    if (
      eventStartMinutes === null ||
      eventEndMinutes === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event time format is invalid",
      });
    }

    let currentTime = eventStartMinutes;
    let totalTaskMinutes = 0;

    for (const currentTask of event.tasks) {
      const taskDuration =
        Number(currentTask.duration);

      if (
        !Number.isInteger(taskDuration) ||
        taskDuration <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Task "${currentTask.taskName}" has an invalid duration`,
        });
      }

      const taskStartMinutes = currentTime;
      const taskEndMinutes = currentTime + taskDuration;

      if (taskEndMinutes > maxTaskEndMinutes) {
        maxTaskEndMinutes = taskEndMinutes;
      }

      currentTask.startTime =
        formatTime(taskStartMinutes);

      currentTask.endTime =
        formatTime(taskEndMinutes);

      currentTime = taskEndMinutes;

      totalTaskMinutes += taskDuration;
    }

    if (maxTaskEndMinutes > eventEndMinutes) {
      event.endTime = formatTime(maxTaskEndMinutes);
    }

    await event.save();

    // Fetch again with coordinator populated
    const updatedEvent = await Event.findById(
      event._id
    ).populate({
      path: "tasks.coordinator",
      select: "_id fullName email phone",
    });

    const totalEventMinutes =
      eventEndMinutes - eventStartMinutes;

    const remainingMinutes =
      totalEventMinutes - totalTaskMinutes;

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",

      schedule: {
        totalEventDuration:
          `${totalEventMinutes} minutes`,

        totalTaskDuration:
          `${totalTaskMinutes} minutes`,

        remainingTime:
          `${remainingMinutes} minutes`,

        remainingTimeFormatted:
          `${Math.floor(
            remainingMinutes / 60
          )} hours ${remainingMinutes % 60
          } minutes`,
      },

      data: updatedEvent,
    });
  } catch (error) {
    console.error(
      "Update task error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating task",
    });
  }
};

// =====================================================
// ASSIGN COORDINATOR TO TASK
// =====================================================

const assignCoordinatorToTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { coordinatorId } = req.body;

    if (!coordinatorId) {
      return res.status(400).json({
        success: false,
        message: "Coordinator ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(coordinatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const event = await findEventForManagement(id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const task = event.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const user = await User.findById(coordinatorId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified !== true) {
      return res.status(400).json({
        success: false,
        message: "Only email-verified users can be assigned as task coordinators",
      });
    }

    const joined = event.coordinators.some(
      (userId) =>
        userId.toString() === coordinatorId.toString()
    );

    if (!joined) {
      return res.status(400).json({
        success: false,
        message:
          "User must join the event before being assigned to a task",
      });
    }

    task.coordinator = coordinatorId;

    await event.save();

    try {
      await Notification.create({
        recipient: coordinatorId,
        recipientModel: "User",
        sender: req.user.id,
        senderModel: req.user.role === "ADMIN" ? "Admin" : "Organizer",
        event: event._id,
        taskId: task._id.toString(),
        type: "TASK_TIMING_CHANGED",
        message: `You have been assigned to task "${task.taskName}" in event "${event.eventName}".`,
      });
    } catch (notifErr) {
      console.error("Notification error on assign coordinator:", notifErr);
    }

    const updatedEvent = await Event.findById(event._id)
      .populate({
        path: "coordinators",
        select: "_id fullName email phone",
      })
      .populate({
        path: "tasks.coordinator",
        select: "_id fullName email phone",
      });

    return res.status(200).json({
      success: true,
      message: "Coordinator assigned to task successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error(
      "Assign coordinator to task error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while assigning coordinator",
    });
  }
};

// =====================================================
// UPDATE EVENT
// =====================================================

const updateEvent = async (req, res) => {
  try {
    const event = await findEventForManagement(req.params.id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      numberOfCoordinators,
      eventPlace,
      tasks,
    } = req.body;

    if (eventName !== undefined) {
      event.eventName = eventName.trim();
    }

    if (eventDate !== undefined) {
      event.eventDate = eventDate;
    }

    if (numberOfCoordinators !== undefined) {
      if (
        !Number.isInteger(
          Number(numberOfCoordinators)
        ) ||
        Number(numberOfCoordinators) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Number of coordinators must be at least 1",
        });
      }

      event.numberOfCoordinators =
        Number(numberOfCoordinators);
    }

    if (eventPlace !== undefined) {
      event.eventPlace =
        eventPlace.trim();
    }

    const newStartTime =
      startTime !== undefined
        ? startTime.trim()
        : event.startTime;

    const newEndTime =
      endTime !== undefined
        ? endTime.trim()
        : event.endTime;

    const eventStartMinutes =
      parseTime(newStartTime);

    const eventEndMinutes =
      parseTime(newEndTime);

    if (
      eventStartMinutes === null ||
      eventEndMinutes === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start time and end time must be in format HH:MM AM/PM",
      });
    }

    if (
      eventEndMinutes <= eventStartMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event end time must be after start time",
      });
    }

    event.startTime = newStartTime;
    event.endTime = newEndTime;

    // =====================================================
    // UPDATE TASKS
    // =====================================================

    if (tasks !== undefined) {
      if (
        !Array.isArray(tasks) ||
        tasks.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one task is required",
        });
      }

      let currentTime = eventStartMinutes;
      let totalTaskMinutes = 0;
      let maxTaskEndMinutes = eventEndMinutes;

      const formattedTasks = [];

      for (
        let index = 0;
        index < tasks.length;
        index++
      ) {
        const task = tasks[index];

        if (
          !task ||
          typeof task.taskName !==
          "string" ||
          !task.taskName.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Task ${index + 1} must have a valid taskName`,
          });
        }

        const duration =
          Number(task.duration);

        if (
          !Number.isInteger(duration) ||
          duration <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Task ${index + 1} must have a valid duration in minutes`,
          });
        }

        const taskStartMinutes = currentTime;
        const taskEndMinutes = currentTime + duration;

        if (taskEndMinutes > maxTaskEndMinutes) {
          maxTaskEndMinutes = taskEndMinutes;
        }

        let coordinatorId = null;

        if (
          task.coordinator !== undefined &&
          task.coordinator !== null &&
          task.coordinator !== ""
        ) {
          if (!mongoose.Types.ObjectId.isValid(task.coordinator)) {
            return res.status(400).json({
              success: false,
              message: `Invalid coordinator ID for task: ${task.taskName || "Unknown task"
                }`,
            });
          }

          const isJoinedUser = event.coordinators.some(
            (userId) =>
              userId.toString() === task.coordinator.toString()
          );

          if (!isJoinedUser) {
            return res.status(400).json({
              success: false,
              message: `User must join the event before being assigned to task: ${task.taskName || "Unknown task"
                }`,
            });
          }

          coordinatorId = task.coordinator;
        }

        formattedTasks.push({
          taskName:
            task.taskName.trim(),

          duration,

          description:
            task.description || "",

          startTime:
            formatTime(taskStartMinutes),

          endTime:
            formatTime(taskEndMinutes),

          coordinator:
            coordinatorId,

          priority:
            task.priority || "MEDIUM",

          status:
            task.status || "PENDING",

          guidelines:
            task.guidelines || "",

          remarks:
            task.remarks || "",

          progress:
            typeof task.progress ===
              "number"
              ? task.progress
              : 0,
        });

        currentTime = taskEndMinutes;

        totalTaskMinutes += duration;
      }

      event.tasks = formattedTasks;

      if (maxTaskEndMinutes > eventEndMinutes) {
        event.endTime = formatTime(maxTaskEndMinutes);
      }
    }

    await event.save();

    // Return populated event
    const updatedEvent =
      await Event.findById(
        event._id
      ).populate({
        path: "tasks.coordinator",
        select:
          "_id fullName email phone",
      });

    const totalEventMinutes =
      eventEndMinutes -
      eventStartMinutes;

    const totalTaskMinutes =
      event.tasks.reduce(
        (total, task) =>
          total + Number(task.duration),
        0
      );

    const remainingMinutes =
      totalEventMinutes -
      totalTaskMinutes;

    return res.status(200).json({
      success: true,
      message:
        "Event updated successfully",

      schedule: {
        totalEventDuration:
          `${totalEventMinutes} minutes`,

        totalTaskDuration:
          `${totalTaskMinutes} minutes`,

        remainingTime:
          `${remainingMinutes} minutes`,
      },

      data: updatedEvent,
    });
  } catch (error) {
    console.error(
      "Update event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating event",
    });
  }
};

// =====================================================
// DELETE SINGLE TASK
// =====================================================

const deleteTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    const event = await findEventForManagement(id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const task = event.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found in this event",
      });
    }

    task.deleteOne();

    await event.save();

    return res.status(200).json({
      success: true,
      message:
        "Task deleted successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "Delete task error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting task",
    });
  }
};

// =====================================================
// DELETE EVENT
// =====================================================

const deleteEvent = async (req, res) => {
  try {
    const event = await findEventForManagement(req.params.id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.findByIdAndDelete(
      event._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Event deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting event",
    });
  }
};

// =====================================================
// UPDATE EVENT STATUS
// =====================================================

const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "DRAFT",
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const event = await findEventForManagement(req.params.id, req.user);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const currentStatus = event.status;

    const validTransitions = {
      DRAFT: ["UPCOMING", "CANCELLED"],
      UPCOMING: ["ONGOING", "CANCELLED"],
      ONGOING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (
      currentStatus !== status &&
      !validTransitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change event status from ${currentStatus} to ${status}`,
      });
    }

    event.status = status;

    await event.save();

    try {
      if (req.user.role === "ADMIN" && event.organizerId) {
        await Notification.create({
          recipient: event.organizerId,
          recipientModel: "Organizer",
          sender: req.user.id,
          senderModel: "Admin",
          event: event._id,
          type: "TASK_TIMING_CHANGED",
          message: `Admin updated status of event "${event.eventName}" to ${status}.`,
        });
      } else if (req.user.role === "ORGANIZER") {
        const admins = await Admin.find({ isActive: true });
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            recipientModel: "Admin",
            sender: req.user.id,
            senderModel: "Organizer",
            event: event._id,
            type: "TASK_TIMING_CHANGED",
            message: `Event "${event.eventName}" status updated to ${status}.`,
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification error on update event status:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Event status updated successfully",
      data: {
        id: event._id,
        eventName: event.eventName,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Update event status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating event status",
    });
  }
};

// =====================================================
// TASK VERIFICATION - USER SUBMIT & ORGANIZER VERIFY
// =====================================================

const submitTaskForVerification = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { remarks } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const task = event.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isAssignedUser = task.coordinator && task.coordinator.toString() === req.user.id.toString();
    const isOrganizer = event.organizerId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isAssignedUser && !isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only assigned coordinator or organizer can update task status" });
    }

    task.status = "SUBMITTED_FOR_VERIFICATION";
    task.submittedAt = new Date();
    task.progress = 100;
    if (remarks) task.remarks = remarks.trim();

    await event.save();

    const userWhoSubmitted = await User.findById(req.user.id);
    const submitterName = userWhoSubmitted ? userWhoSubmitted.fullName : "Coordinator";

    await Notification.create({
      recipient: event.organizerId,
      recipientModel: "Organizer",
      sender: req.user.id,
      senderModel: req.user.role === "ORGANIZER" ? "Organizer" : req.user.role === "ADMIN" ? "Admin" : "User",
      event: event._id,
      taskId: task._id.toString(),
      type: "TASK_COMPLETED",
      message: `Task completed: "${task.taskName}" for "${event.eventName}" was submitted for verification by ${submitterName}.`,
    });

    return res.status(200).json({
      success: true,
      message: "Task submitted for verification successfully",
      data: event,
    });
  } catch (error) {
    console.error("Submit task for verification error:", error);
    return res.status(500).json({ success: false, message: "Server error while submitting task" });
  }
};

const verifyTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { status = "VERIFIED", remarks } = req.body;

    let event;
    if (req.user.role === "ADMIN") {
      event = await Event.findById(id);
    } else {
      event = await Event.findOne({ _id: id, organizerId: req.user.id });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found or unauthorized" });
    }

    const task = event.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.status = status;
    task.verifiedAt = new Date();
    task.progress = 100;
    if (remarks) task.remarks = remarks.trim();

    await event.save();

    if (task.coordinator) {
      await Notification.create({
        recipient: task.coordinator,
        recipientModel: "User",
        sender: req.user.id,
        senderModel: req.user.role === "ADMIN" ? "Admin" : "Organizer",
        event: event._id,
        taskId: task._id.toString(),
        type: "TASK_VERIFIED",
        message: `Task verified: "${task.taskName}" in "${event.eventName}" has been verified and confirmed by the organizer.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task verified successfully",
      data: event,
    });
  } catch (error) {
    console.error("Verify task error:", error);
    return res.status(500).json({ success: false, message: "Server error while verifying task" });
  }
};

// =====================================================
// DELAYED TASK EXTENSION & SEQUENTIAL RESCHEDULING
// =====================================================

const rescheduleEventTasks = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { newDuration, extensionMinutes } = req.body;

    let event;
    if (req.user.role === "ADMIN") {
      event = await Event.findById(id);
    } else {
      event = await Event.findOne({ _id: id, organizerId: req.user.id });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found or unauthorized" });
    }

    const taskIndex = event.tasks.findIndex((t) => t._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const targetTask = event.tasks[taskIndex];
    let delta = 0;

    if (newDuration !== undefined && Number(newDuration) > 0) {
      delta = Number(newDuration) - targetTask.duration;
      targetTask.duration = Number(newDuration);
    } else if (extensionMinutes !== undefined && Number(extensionMinutes) > 0) {
      delta = Number(extensionMinutes);
      targetTask.duration += delta;
    }

    if (delta <= 0) {
      return res.status(400).json({ success: false, message: "Extension minutes or duration increase must be greater than 0" });
    }

    const targetStartMin = parseTime(targetTask.startTime);
    if (targetStartMin !== null) {
      const targetEndMin = targetStartMin + targetTask.duration;
      targetTask.endTime = formatTime(targetEndMin);
    }

    for (let i = taskIndex + 1; i < event.tasks.length; i++) {
      const currentTask = event.tasks[i];
      const prevTask = event.tasks[i - 1];

      currentTask.startTime = prevTask.endTime;
      const startMin = parseTime(currentTask.startTime);
      if (startMin !== null) {
        const endMin = startMin + currentTask.duration;
        currentTask.endTime = formatTime(endMin);
      }

      if (currentTask.coordinator) {
        await Notification.create({
          recipient: currentTask.coordinator,
          recipientModel: "User",
          sender: req.user.id,
          senderModel: req.user.role === "ADMIN" ? "Admin" : "Organizer",
          event: event._id,
          taskId: currentTask._id.toString(),
          type: "TASK_TIMING_CHANGED",
          message: `Task timing updated: "${currentTask.taskName}" in "${event.eventName}" has been rescheduled to ${currentTask.startTime} - ${currentTask.endTime}.`,
        });
      }
    }

    if (event.tasks.length > 0) {
      const lastTask = event.tasks[event.tasks.length - 1];
      const lastTaskEndMin = parseTime(lastTask.endTime);
      const eventEndMin = parseTime(event.endTime);

      if (lastTaskEndMin !== null && eventEndMin !== null && lastTaskEndMin > eventEndMin) {
        event.endTime = lastTask.endTime;
      }
    }

    targetTask.status = "IN_PROGRESS";
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Task duration extended and subsequent tasks rescheduled successfully",
      data: event,
    });
  } catch (error) {
    console.error("Reschedule event tasks error:", error);
    return res.status(500).json({ success: false, message: "Server error while rescheduling tasks" });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createEvent,
  getOrganizerEvents,
  getEventById,
  getUpcomingEvents,
  getJoinedEvents,
  getEventCoordinators,

  sendJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getMyJoinRequest,

  leaveEvent,
  updateTask,
  updateEvent,
  assignCoordinatorToTask,
  deleteTask,
  deleteEvent,
  updateEventStatus,

  submitTaskForVerification,
  verifyTask,
  rescheduleEventTasks,
};