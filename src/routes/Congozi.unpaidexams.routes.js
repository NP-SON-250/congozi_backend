import express from "express";
import {
  getLoggedInUserUnpaidExams,
  getLoggedInUserSingleUnpaid,
  deleteUnpaid,
} from "../controllers/Congozi.unpaidexams.controllers";
import { normal } from "../middleware/middleware";

const unpaidExamRoute = express.Router();
unpaidExamRoute.get("/", normal, getLoggedInUserUnpaidExams);
unpaidExamRoute.get("/:id", normal, getLoggedInUserSingleUnpaid);
unpaidExamRoute.delete("/:id", deleteUnpaid);

export default unpaidExamRoute;
