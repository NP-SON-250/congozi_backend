import express from "express";
import { 
    createOptions,
    updateOption,
    getAllOptions,
    getOptionById,
    deletsOption,
 } from "../controllers/Congozi.options.controllers";
import fileUpload from "../helper/multer";
import { normal,supperAdmins } from "../middleware/middleware";
const optionRoute = express.Router();
optionRoute.post("/:id", normal,fileUpload.single("text"), createOptions);
optionRoute.put("/:id", normal,fileUpload.single("text"), updateOption);
optionRoute.delete("/:id",supperAdmins, deletsOption);
optionRoute.get("/:question", getAllOptions);
optionRoute.get("/single/:id", getOptionById);

export default optionRoute;
