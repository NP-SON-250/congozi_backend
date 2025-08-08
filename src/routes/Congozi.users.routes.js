import express from "express";
import {
  login,
  loginSchools,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  createUsers,
} from "../controllers/Congozi.users.controllers";
import fileUpload from "../helper/multer";
import Users from "../models/Congozi.users.model";
import { normal, supperAdmins } from "../middleware/middleware";
import bcrypt from "bcrypt";

const userRoute = express.Router();
userRoute.get("/:id", getUserById);
userRoute.get("/", getAllUsers);
userRoute.post("/auth/school", fileUpload.single("password"), loginSchools);
userRoute.post("/auth", fileUpload.single("password"), login);
userRoute.post("/verify-password", normal, async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const user = await Users.findById(userId);
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
userRoute.post("/", fileUpload.single("profile"), createUsers);
userRoute.put("/:id", normal, fileUpload.single("profile"), updateUser);
userRoute.delete("/:id", supperAdmins, deleteUser);

export default userRoute;
