import * as userService from "../services/Congozi.users.services.js";
import {
  validateLoginUser,
  validateUpdateUser,
} from "../validation/Congozi.users.validation.js";
import generateToken from "../utils/generateToken.js";
import Users from "../models/Congozi.users.model.js";
import bcrypt from "bcrypt";
import { uploadToCloud } from "../helper/cloud.js";

// Create User
export const createUsers = async (req, res) => {
  const {
    fName,
    lName,
    idCard,
    address,
    phone,
    email,
    password,
    role,
    companyName,
    tin,
  } = req.body;

  try {
    const [emailExist, idCardExist, phoneExist, companyNameExist, tinExist] =
      await Promise.all([
        Users.findOne({ email }),
        Users.findOne({ idCard }),
        Users.findOne({ phone }),
        Users.findOne({ companyName }),
        Users.findOne({ tin }),
      ]);

    if (emailExist || idCardExist || phoneExist || companyNameExist || tinExist) {
      const message = emailExist ? "Email is already taken" :
                      idCardExist ? "ID card is already used" :
                      phoneExist ? "Phone number is already used" :
                      tinExist ? "TIN number is already used" :
                      "Company name is already used";
      return res.status(400).json({ status: "400", message });
    }

    let profileImage = null;
    if (req.file) profileImage = await uploadToCloud(req.file);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      fName,
      lName,
      idCard,
      address,
      phone,
      email,
      role,
      companyName,
      tin,
      password: hashedPassword,
      profile: profileImage,
    });

    return res.status(200).json({
      status: "200",
      message: "Kwiyandikisha byagenze neza",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: err.message,
    });
  }
};
// Controller to login function
export const login = async (req, res) => {
  const { error, value } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await userService.loginUser(value);
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Kwinjira byakunze",
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};
// Controller to login function by schools
export const loginSchools = async (req, res) => {
  const { error, value } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await userService.loginSchool(value);
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Kwinjira byakunze",
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { error, value } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, value, req.file);

    return res.status(200).json({
      message: "User updated",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await userService.deleteUser(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({
      status: "200",
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return res.status(200).json({
      status: "200",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo kidasanzwe",
      error: error.message,
    });
  }
};
