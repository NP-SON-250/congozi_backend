import express from "express";
import {
  purchasedItem,
  getUserPending,
  getUserAdmin,
  getUserComplete,
  getLoggedInUserSinglePurchase,
  deleteUserPurchase,
  updatedPurchase,
  examByCode,
  getUserPurchase,
  updateAccessCodePurchase,
  getAllUserPayments,
} from "../controllers/Congozi.purchases.controllers";
import fileUpload from "../helper/multer";
import {
  admins,
  students,
  schools,
  normal,
  supperAdmins,
} from "../middleware/middleware";

const purchaseRoute = express.Router();

// GET routes
purchaseRoute.get("/access/:code", normal, examByCode);
purchaseRoute.get("/pending", normal, getUserPending);
purchaseRoute.get("/all", normal, getAllUserPayments);
purchaseRoute.get("/complete", normal, getUserComplete);
purchaseRoute.get("/user", normal, getUserPurchase);
purchaseRoute.get("/:purchaseId", normal, getLoggedInUserSinglePurchase);
purchaseRoute.get("/", getUserAdmin);

// POST routes
purchaseRoute.post(
  "/:itemId",
  fileUpload.single("status"),
  normal,
  purchasedItem
);

// PUT route
purchaseRoute.put("/:id", fileUpload.single("status"), updatedPurchase);

// DELETE route
purchaseRoute.delete("/:paymentsId", supperAdmins, deleteUserPurchase);
purchaseRoute.put("/access/:accessCode", updateAccessCodePurchase);

export default purchaseRoute;
