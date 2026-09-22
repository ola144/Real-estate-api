const mongoose = require("mongoose");
const Booking = require("../Models/bookings");
const Property = require("../Models/property");
const { sendBookingEmail } = require("../utils/email");

const bookingPopulation = [
  {
    path: "property",
    select: "title photo price location agent status listingType",
    populate: {
      path: "agent",
      select: "name email phone photo role",
    },
  },
  {
    path: "customer",
    select: "name email phone photo role",
  },
  {
    path: "agent",
    select: "name email phone photo role",
  },
];

const isStaff = (user) => ["admin", "agent"].includes(user.role);

const canManageBooking = (booking, user) => {
  if (isStaff(user)) {
    return true;
  }

  return booking.customer._id.toString() === user._id.toString();
};

exports.createBooking = async (req, res) => {
  try {
    const { property, date, time, guests, name, email, phone } = req.body;

    if (!property || !date || !time || !guests || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Property, date, time, guests, name, email and phone are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property id.",
      });
    }

    const singleProperty = await Property.findOne({ _id: property }).populate({
      path: "agent",
      select: "name email",
    });

    if (!singleProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (!singleProperty.agent) {
      return res.status(400).json({
        success: false,
        message: "This property does not have an assigned agent.",
      });
    }

    const agentEmail = singleProperty.agent.email;

    if (!agentEmail) {
      console.error("Agent has no email:", singleProperty.agent);

      return res.status(400).json({
        success: false,
        message: "The assigned agent does not have an email address.",
      });
    }

    const booking = await Booking.create({
      property,
      customer: req.user._id,
      agent: singleProperty.agent._id,
      date,
      time,
      guests,
      name,
      email,
      phone,
    });

    await booking.populate(bookingPopulation);

    let emailSent = false;

    try {
      await sendBookingEmail(agentEmail, singleProperty.agent.name, name);

      emailSent = true;
    } catch (error) {
      console.error("Booking email failed:", error);
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
      emailSent,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const query = isStaff(req.user) ? {} : { customer: req.user._id };

    const bookings = await Booking.find(query)
      .populate(bookingPopulation)
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id.",
      });
    }

    const booking = await Booking.findById(id).populate(bookingPopulation);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      !isStaff(req.user) &&
      booking.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this booking.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking.",
    });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id.",
      });
    }

    if (!isStaff(req.user) && req.user._id.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view these bookings.",
      });
    }

    const bookings = await Booking.find({ customer: customerId })
      .populate(bookingPopulation)
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer bookings.",
    });
  }
};

exports.getAgentBookings = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent id.",
      });
    }

    const bookings = await Booking.find({ agent: agentId })
      .populate(bookingPopulation)
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get agent bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch agent bookings.",
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    const booking = await Booking.findById(id)
      .populate("customer", "name")
      .populate("property");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this booking.",
      });
    }

    if (booking.status === "completed" && status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "A completed booking cannot be changed.",
      });
    }

    booking.status = status;
    await booking.save();

    console.log(status);

    if (status === "completed") {
      const property = booking.property;

      if (!property) {
        return res.status(400).json({
          success: false,
          message: "The property associated with this booking was not found.",
        });
      }

      let propertyStatus;

      if (property.listingType === "sale") {
        propertyStatus = "sold";
      } else if (property.listingType === "rent") {
        propertyStatus = "rented";
      }

      if (propertyStatus) {
        property.status = propertyStatus;
        await property.save();
      }
    }

    await booking.populate(bookingPopulation);

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id.",
      });
    }

    const booking = await Booking.findById(id).populate("customer", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this booking.",
      });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete booking.",
    });
  }
};
