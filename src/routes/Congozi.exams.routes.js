import express from "express";
import {
  createExamination,
  updateExam,
  getAllExams,
  getExamById,
  deleteExam,
  getExamNumber,
} from "../controllers/Congozi.exams.controllers";
import fileUpload from "../helper/multer";
import { normal,admins,supperAdmins } from "../middleware/middleware";

const examRoute = express.Router();
examRoute.post("/", normal,fileUpload.single("title"), createExamination);
examRoute.put("/:id",normal, fileUpload.single("title"), updateExam);
examRoute.delete("/:id",supperAdmins, deleteExam);
examRoute.get("/", getAllExams);
examRoute.get("/:id", getExamById);
examRoute.get("/kora/:number",normal, getExamNumber);

export default examRoute;
