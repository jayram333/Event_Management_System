const authMiddleware = require("./authMiddleware");
const adminMiddleware = (req, res, next) => {
  // First verify JWT
  authMiddleware(req, res, () => {
    // Then check role
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    next();
  });
};

module.exports = adminMiddleware;