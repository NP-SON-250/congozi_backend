import express from "express";
import {
  createAccount,
  updateAccount,
  getAllAccount,
  getAccountById,
  deleteAccount,
} from "../controllers/Congozi.accounts.controllers";
import fileUpload from "../helper/multer";
import { normal, admins, supperAdmins } from "../middleware/middleware";

const accountRoute = express.Router();
accountRoute.post("/", normal, fileUpload.single("title"), createAccount);
accountRoute.put("/:id", normal, fileUpload.single("title"), updateAccount);
accountRoute.delete("/:id", supperAdmins, deleteAccount);
accountRoute.get("/", getAllAccount);
accountRoute.get("/:id", getAccountById);

export default accountRoute;
