import UnpaidAccounts from "../models/Congozi.unpaidaccounts.models";
import UnpaidExams from "../models/Congozi.unpaidexams.models";
import WaittingAccounts from "../models/Congozi.waittingaccounts.models";
import WaittingExams from "../models/Congozi.waittingexams.models";
import payments from "../models/Congozi.payments.models";
import Exams from "../models/Congozi.exams.models";
import Accounts from "../models/Congozi.accounts.models";
import TotalUserExams from "../models/Congozi.totaluserexams.models";
import TotalUserAccounts from "../models/Congozi.totaluseraccounts.models";
import PassedExams from "../models/Congozi.passedexams.models";
import FailledExams from "../models/Congozi.failedexams.models";
import ExpiredExams from "../models/Congozi.expiredexams.models";
import ExpiredAccounts from "../models/Congozi.expiredaccounts.models";

import * as purchaseServices from "../services/Congozi.purchases.services";
import {
  validateCreatePurchase,
  validateUpdatePurchase,
} from "../validation/Congozi.purchases.validation";
const generateAccessCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = letters[Math.floor(Math.random() * letters.length)];

  for (let i = 0; i < 11; i++) {
    code += alphanum[Math.floor(Math.random() * alphanum.length)];
  }

  return code;
};
export const purchasedItem = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const userRole = req.loggedInUser.role;
    const { itemId } = req.params;

    let itemType = null;
    let itemFees = null;
    let item = await Exams.findById(itemId);

    if (item) {
      itemType = "exams";
      itemFees = item.fees;
    } else {
      item = await Accounts.findById(itemId);
      if (item) {
        itemType = "accounts";
        itemFees = item.fees;
      }
    }

    if (!itemType || !item) {
      return res.status(404).json({
        status: "404",
        message: `${itemType} ntibonetse kuboneka.`,
      });
    }
    if (userRole === "student" && itemType !== "exams") {
      return res.status(404).json({
        status: "403",
        message: "Ikizamini kigurwa n'umunyeshuri gusa.",
      });
    }

    if (userRole === "school" && itemType !== "accounts") {
      return res.status(404).json({
        status: "403",
        message: `Konte igurwa na n'ikigo gusa.`,
      });
    }
    const duplicate = await payments.findOne({ itemId, status: "pending" });
    if (duplicate && duplicate.itemType === "accounts") {
      return res.status(400).json({
        status: "400",
        message: `Iyi konte usanzwe warayisabye`,
      });
    }
    if (duplicate && duplicate.itemType === "exams") {
      return res.status(400).json({
        status: "400",
        message: `Icyi kizamini usanzwe waracyisabye`,
      });
    }
    const savedpayments = await payments.create({
      itemType,
      itemId,
      paidBy: userId,
      amount: itemFees,
      accessCode: generateAccessCode(),
      startDate: null,
      endDate: null,
    });

    if (savedpayments) {
      let items = null;
      if (savedpayments.itemType === "exams") {
        items = await Exams.findById(savedpayments.itemId);
      } else if (savedpayments.itemType === "accounts") {
        items = await Accounts.findById(savedpayments.itemId);
      }
      let endDate = null;
      if (savedpayments.itemType === "accounts" && savedpayments.validIn) {
        const days = parseInt(item.validIn.replace(/\D/g, ""));
        endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
      }
      if (itemType === "exams") {
        await UnpaidExams.create({
          exam: itemId,
          paidBy: userId,
          status: "pending",
          purchaseId: savedpayments._id,
        });
      } else if (itemType === "accounts") {
        await UnpaidAccounts.create({
          account: itemId,
          paidBy: userId,
          status: "pending",
          purchaseId: savedpayments._id,
        });
      }
      if (itemType === "exams") {
        await TotalUserExams.create({
          exam: itemId,
          accessCode: savedpayments.accessCode,
          purchaseId: savedpayments._id,
          paidBy: userId,
        });
      } else if (itemType === "accounts") {
        await TotalUserAccounts.create({
          account: itemId,
          accessCode: savedpayments.accessCode,
          purchaseId: savedpayments._id,
          paidBy: userId,
        });
      }
    }
    return res.status(201).json({
      status: "201",
      message: `Gusaba igura rya ${itemType} byakunze`,
      data: savedpayments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "500",
      message: `Kugura ${itemType} biranze`,
      error: err.message,
    });
  }
};
export const purchasedAndPaidItem = async (req, res) => {
  const { error, value } = validateCreatePurchase(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const userId = req.loggedInUser.id;
    const userRole = req.loggedInUser.role;
    const { itemId } = req.params;
    const result = await purchaseServices.makePaidpayments(
      userId,
      userRole,
      itemId,
      value
    );
    return res.status(201).json({
      status: "201",
      message: "Purchase and paid success",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const updatedPurchase = async (req, res) => {
  const { error, value } = validateUpdatePurchase(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const { id } = req.params;
    const updatepayment = await purchaseServices.updatepayments(id, value);

    return res.status(200).json({
      message: "Purchase updated",
      data: updatepayment,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getUserPending = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getPendingpayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getAllUserPayments = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getAllPayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getUserComplete = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getCompletepayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const examByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.loggedInUser.id;
    const exams = await purchaseServices.getExamsByAccessCode(code, userId);

    return res.status(200).json({
      status: "200",
      message: "Exam retrieved by access code",
      data: exams,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "404",
      message: "Exam not found with the given access code",
      error: error.message,
    });
  }
};

export const getUserAdmin = async (req, res) => {
  try {
    const purchases = await purchaseServices.getAdminpayments();

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserPurchase = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getUserspayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getLoggedInUserSinglePurchase = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const { purchaseId } = req.params;

    const purchase = await purchaseServices.getSingleUserPurchase(
      userId,
      purchaseId
    );

    return res.status(200).json({
      status: "200",
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "404",
      message: "Purchase not found",
      error: error.message,
    });
  }
};

export const deleteUserPurchase = async (req, res) => {
  try {
    const { paymentsId } = req.params;

    const payment = await payments.findById(paymentsId);
    if (!payment) {
      return res.status(404).json({
        status: "404",
        message: "Payment Not found",
      });
    }
    const result = await payments.findByIdAndDelete(paymentsId);
    const itemId = payment.itemId;
    await UnpaidExams.deleteOne({
      exam: itemId,
    });
    await WaittingExams.deleteOne({
      exam: itemId,
    });

    await PassedExams.deleteOne({
      exam: itemId,
    });
    await FailledExams.deleteOne({
      exam: itemId,
    });
    await ExpiredExams.deleteOne({
      exam: itemId,
    });
    await TotalUserExams.deleteOne({
      exam: itemId,
    });
    await WaittingAccounts.deleteOne({
      account: itemId,
    });
    await UnpaidAccounts.deleteOne({
      account: itemId,
    });
    await TotalUserAccounts.deleteOne({
      account: itemId,
    });
    await ExpiredAccounts.deleteOne({
      account: itemId,
    });
    return res.status(200).json({
      status: "200",
      message: "payment deleted",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

export const updateAccessCodePurchase = async (req, res) => {
  try {
    const { accessCode } = req.params;
    const payment = await payments.findOne({ accessCode });
    if (!payment) {
      return res.status(404).json({
        status: "404",
        message: "Payment not found",
      });
    }
    const id = payment._id;
    const endDate = new Date();
    const updatepayment = await payments.findByIdAndUpdate(id, {
      status: "expired",
      endDate: endDate,
    });
    await WaittingExams.deleteOne({ accessCode });
    return res.status(200).json({
      message: "Purchase updated",
      data: updatepayment,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
