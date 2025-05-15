import express from "express";
import {
  login,
  loginSchools,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  createUsers
} from "../controllers/Congozi.users.controllers";
import fileUpload from "../helper/multer";
import Users from "../models/Congozi.users.model";
import { normal } from "../middleware/middleware";
import bcrypt from "bcrypt";

const userRoute = express.Router();

// GET routes (read operations)
userRoute.get("/:id", getUserById);  // Specific ID first
userRoute.get("/", getAllUsers);     // General route last

// POST routes (create operations)
userRoute.post("/auth/school", fileUpload.single("password"), loginSchools); // Specific auth first
userRoute.post("/auth", fileUpload.single("password"), login);               // General auth second
userRoute.post("/verify-password", normal, async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const user = await Users.findById(userId);
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
userRoute.post("/", fileUpload.single("profile"), createUsers); // General create last

// PUT route (update operation)
userRoute.put("/:id", fileUpload.single("profile"), updateUser);

// DELETE route
userRoute.delete("/:id", deleteUser);

export default userRoute;