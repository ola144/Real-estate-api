const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const http = require("node:http");
const server = require("./app.js");
const mongoose = require("mongoose");
const port = process.env.PORT;
const url = process.env.MONGO_CONN_URL;
const { initializeSocket } = require("./socket/socket.js");

mongoose.connect(url);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("DB connection successfully!");
});

db.on("error", () => {
  console.log("DB Connection failed");
});

server.listen(port, () => {
  console.log("Listening requests on PORT: " + port);
});
