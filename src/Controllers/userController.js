const User = require("../Models/user");
const { receiveEmail, sellPropertyEmail } = require("../utils/email");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exist!",
      });
    }

    const newUser = await User.create({
      name,
      email,
      avatar,
    });

    res.status(200).json({
      success: true,
      message: "User created Successfully!",
      data: newUser,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).populate("allProperties");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User found successfully!",
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "User details updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.messsage,
    });
  }
};

exports.userContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    await receiveEmail({
      subject: subject,
      sender: `${firstName} ${lastName}`,
      html: message,
      senderEmail: email,
    });

    res.status(200).json({
      success: true,
      message: "Contact sent successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.requestToSellProperty = async (req, res) => {
  try {
    const { name, email, phone, address, type, notes } = req.body;

    await sellPropertyEmail({
      name: name,
      email: email,
      phone: phone,
      propertyType: type,
      propertyAddress: address,
      additionalMessage: notes,
    });

    res.status(200).json({
      success: true,
      message: "Request sent successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
