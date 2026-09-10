const express = require("express");

const {
  getOrganizerProfile,
  updateOrganizerProfile,
  changeOrganizerPassword,
} = require("../controllers/organizerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get organizer profile
router.get(
  "/profile",
  authMiddleware,
  getOrganizerProfile
);

// Update organizer profile
router.put(
  "/profile",
  authMiddleware,
  updateOrganizerProfile
);

// Change organizer password
router.put(
  "/change-password",
  authMiddleware,
  changeOrganizerPassword
);

module.exports = router;