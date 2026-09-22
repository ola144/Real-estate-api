const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: [true, "Booking date is required!"],
    },

    time: {
      type: String,
      required: [true, "Booking time is required!"],
      trim: true,
    },

    guests: {
      type: Number,
      required: [true, "Number of guests is required!"],
      min: [1, "A booking must have at least one guest!"],
    },

    name: {
      type: String,
      required: [true, "Guest name is required!"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Guest email is required!"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Guest phone is required!"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
      },
    },

    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
      },
    },
  },
);

bookingSchema.index({ customer: 1, date: -1 });
bookingSchema.index({ property: 1, date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
