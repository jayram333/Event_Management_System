const express = require("express");

const {
  createEvent,
  getOrganizerEvents,
  getEventById,
  getUpcomingEvents,
  getJoinedEvents,
  getEventCoordinators,

  sendJoinRequest,
  getMyJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,

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
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ORGANIZER & ADMIN ROUTES
// =====================================================

// Create event
router.post(
  "/",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  createEvent
);

// Get organizer's events
router.get(
  "/",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  getOrganizerEvents
);

// Upcoming events
// IMPORTANT: Must be before /:id
router.get(
  "/upcoming",
  authMiddleware,
  requireRole("USER"),
  getUpcomingEvents
);

// Joined/approved events
// IMPORTANT: Must be before /:id
router.get(
  "/joined",
  authMiddleware,
  requireRole("USER"),
  getJoinedEvents
);

// =====================================================
// JOIN REQUEST ROUTES
// =====================================================

// USER sends request to join an event as coordinator
router.post(
  "/:id/join-request",
  authMiddleware,
  requireRole("USER"),
  sendJoinRequest
);

// USER checks their own request
router.get(
  "/:id/join-request",
  authMiddleware,
  requireRole("USER"),
  getMyJoinRequest
);

// ORGANIZER gets requests for their event
router.get(
  "/:id/join-requests",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  getJoinRequests
);

// ORGANIZER approves a user's request
router.patch(
  "/:id/join-requests/:userId/approve",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  approveJoinRequest
);

// ORGANIZER rejects a user's request
router.patch(
  "/:id/join-requests/:userId/reject",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  rejectJoinRequest
);

// =====================================================
// COORDINATOR ROUTES
// =====================================================

// Organizer gets approved coordinators
router.get(
  "/:id/coordinators",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  getEventCoordinators
);

// User leaves an event
router.delete(
  "/:id/join",
  authMiddleware,
  requireRole("USER"),
  leaveEvent
);

// =====================================================
// TASK ROUTES
// =====================================================

// Submit task for verification (User / Coordinator / Admin)
router.patch(
  "/:id/tasks/:taskId/submit",
  authMiddleware,
  submitTaskForVerification
);

// Verify task (Organizer / Admin)
router.patch(
  "/:id/tasks/:taskId/verify",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  verifyTask
);

// Reschedule tasks & extend duration (Organizer / Admin)
router.post(
  "/:id/tasks/:taskId/reschedule",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  rescheduleEventTasks
);

// Update task
router.put(
  "/:id/tasks/:taskId",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  updateTask
);

// Assign approved coordinator to task
router.put(
  "/:id/tasks/:taskId/assign",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  assignCoordinatorToTask
);

// Delete task
router.delete(
  "/:id/tasks/:taskId",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  deleteTask
);

// =====================================================
// EVENT MANAGEMENT
// =====================================================

// Update event
router.put(
  "/:id",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  updateEvent
);

// Delete event
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  deleteEvent
);

// Update event status
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  updateEventStatus
);

// =====================================================
// EVENT DETAILS
// =====================================================

// Get event details
router.get(
  "/:id",
  authMiddleware,
  getEventById
);

module.exports = router;