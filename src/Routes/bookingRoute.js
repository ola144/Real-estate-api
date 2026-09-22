const express = require("express");
const {
  createBooking,
  getBookings,
  getBooking,
  getAgentBookings,
  updateBookingStatus,
  getCustomerBookings,
  deleteBooking,
} = require("../Controllers/bookingController");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/agent/:agentId", protect, getAgentBookings);
router.get("/customer/:customerId", protect, getCustomerBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id/update-status", protect, updateBookingStatus);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
