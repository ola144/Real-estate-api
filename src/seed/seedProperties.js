const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const Property = require("../Models/property");
const properties = require("../utils/properties");

const MONGO_URI = process.env.MONGO_CONN_URL;

const seedProperties = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    // Optional: remove existing properties
    await Property.deleteMany({});

    console.log("Existing properties removed");

    // Insert properties
    const insertedProperties = await Property.insertMany(properties);

    console.log(
      `${insertedProperties.length} properties inserted successfully`,
    );

    // Close connection
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding properties:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedProperties();
