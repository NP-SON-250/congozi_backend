import express from "express";
import { 
    updateQuestion,
    getAllQuestions,
    getQuestionById,
    deletsQuestion,
    createQuestions
 } from "../controllers/Congozi.questions.controllers";
import fileUpload from "../helper/multer";
import { normal, supperAdmins } from "../middleware/middleware";

const questionRoute = express.Router();
questionRoute.post("/:id",normal, fileUpload.single("image"), createQuestions);
questionRoute.put("/:id", normal,fileUpload.single("image"), updateQuestion);
questionRoute.delete("/:id",supperAdmins, deletsQuestion);
questionRoute.get("/:exam", getAllQuestions);
questionRoute.get("/single/:id", getQuestionById);

export default questionRoute;
