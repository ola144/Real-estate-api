const express = require("express");
const {
  getAllUsers,
  createUser,
  getUserInfoById,
  updateUserDetails,
  userContactMessage,
  requestToSellProperty,
} = require("../Controllers/userController");

const protect = require("../Middleware/authMiddleware");
const {
  getAvailablePropertiesForUser,
} = require("../Controllers/propertyController");

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/").post(createUser);
router.route("/:id").get(getUserInfoById);
router.route("/properties/available").get(getAvailablePropertiesForUser);
router.route("/contact").post(userContactMessage);
router.route("/request-sell").post(requestToSellProperty);
router.route("/update-user").patch(protect, updateUserDetails);

module.exports = router;
