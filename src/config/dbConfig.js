const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_CONN_STR);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("DB connection successfully!");
});

db.on("error", () => {
  console.log("DB Connection failed");
});

module.exports = db;
