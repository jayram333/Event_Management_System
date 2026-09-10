const express = require("express");

const {
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
} = require("../controllers/adminController");

const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Protected admin test
router.get("/protected", adminMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin authentication is working",
    admin: req.user,
  });
});

// Admin profile
router.get(
  "/profile",
  adminMiddleware,
  getAdminProfile
);

// Organizer management
router.get(
  "/organizers",
  adminMiddleware,
  getAllOrganizers
);

router.get(
  "/organizers/:id",
  adminMiddleware,
  getOrganizerById
);

router.put(
  "/organizers/:id/status",
  adminMiddleware,
  updateOrganizerStatus
);

router.delete(
  "/organizers/:id",
  adminMiddleware,
  deleteOrganizer
);

// User management
router.get(
  "/users",
  adminMiddleware,
  getAllUsers
);

router.get(
  "/users/:id",
  adminMiddleware,
  getUserById
);

router.put(
  "/users/:id/status",
  adminMiddleware,
  updateUserStatus
);

router.delete(
  "/users/:id",
  adminMiddleware,
  deleteUser
);

// Event management
router.get(
  "/events",
  adminMiddleware,
  getAllEvents
);

router.get(
  "/events/:id",
  adminMiddleware,
  getEventById
);

module.exports = router;