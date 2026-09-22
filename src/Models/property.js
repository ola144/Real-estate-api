const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property is a required field!"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is a required field!"],
      trim: true,
    },

    propertyType: {
      type: String,
      required: [true, "Property type is a required field!"],
      enum: [
        "Apartment",
        "House",
        "Villa",
        "Commercial",
        "Land",
        "Office",
        "Warehouse",
      ],
    },

    location: {
      country: {
        code: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },
      },

      state: {
        code: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },
      },

      city: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
    },

    price: {
      type: Number,
      required: [true, "Price is a required field!"],
    },

    photo: {
      type: String,
      required: [true, "Property picture is a required field!"],
    },

    photos: {
      type: [String],
      default: [],
    },

    beds: {
      type: Number,
      default: 0,
    },

    baths: {
      type: Number,
      default: 0,
    },

    area: {
      type: Number,
      default: 0,
    },

    facilities: {
      type: [String],
      default: [],
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    listingType: {
      type: String,
      enum: ["rent", "sale"],
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
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

// Indexes for faster searching/filtering

propertySchema.index({
  "location.country.code": 1,
});

propertySchema.index({
  "location.state.code": 1,
});

propertySchema.index({
  "location.city": 1,
});

propertySchema.index({
  propertyType: 1,
});

propertySchema.index({
  price: 1,
});

propertySchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.address": "text",
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
