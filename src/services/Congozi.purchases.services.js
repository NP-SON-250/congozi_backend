import UnpaidAccounts from "../models/Congozi.unpaidaccounts.models";
import UnpaidExams from "../models/Congozi.unpaidexams.models";
import WaittingAccounts from "../models/Congozi.waittingaccounts.models";
import WaittingExams from "../models/Congozi.waittingexams.models";
import payments from "../models/Congozi.payments.models";
import Accounts from "../models/Congozi.accounts.models";
import Notify from "../models/Congozi.notifies.models";

export const updatepayments = async (id, purchaseData) => {
  const { status } = purchaseData;

  try {
    const purchaseExist = await payments.findById(id);
    if (!purchaseExist) {
      throw new Error("Payment not found");
    }
    if (status === "complete") {
      const startDate = new Date();
      let endDate = null;
      if (purchaseExist.itemType === "accounts") {
        const accountItem = await Accounts.findById(purchaseExist.itemId);
        if (accountItem && accountItem.validIn) {
          const days = parseInt(accountItem.validIn.replace(/\D/g, ""));
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + days);
        }
      }
      purchaseData.startDate = startDate;
      purchaseData.endDate = endDate;
    }

    const updatedPurchase = await payments.findByIdAndUpdate(id, purchaseData, {
      new: true,
    });
    if (updatedPurchase.status === "complete") {
      const { itemId, itemType, paidBy } = updatedPurchase;

      if (itemType === "exams") {
        await WaittingExams.create({
          exam: itemId,
          accessCode: updatedPurchase.accessCode,
          paidBy: paidBy,
        });
        await UnpaidExams.deleteOne({ exam: itemId, paidBy });
      } else if (itemType === "accounts") {
        await WaittingAccounts.create({
          account: itemId,
          accessCode: updatedPurchase.accessCode,
          paidBy: paidBy,
        });
        await UnpaidAccounts.deleteOne({ account: itemId, paidBy });
      }
      const note = await Notify.findOne({ purchasedItem: id });
      if (note) {
        const updatedMessage = `Dear 
        ${note.ownerName}, Ubusabe bwawe bwo guhabwa uburenganzira kuri 
        ${updatedPurchase.itemType} wishyuye 
        ${updatedPurchase.amount} bwamaje kwemezwa. Code yokwifashisha ureba ${updatedPurchase.itemType} zawe ni ${updatedPurchase.accessCode}. Murakoze!!! `;
        await Notify.findOneAndUpdate(
          { purchasedItem: id },
          {
            status: "Access Granted",
            message: updatedMessage,
          }
        );
      }
    }

    return updatedPurchase;
  } catch (error) {
    throw new Error(`Error updating purchase: ${error.message}`);
  }
};
export const getUserspayments = async (userId) => {
  try {
    const userpayments = await payments
      .find({ paidBy: userId })
      .populate("paidBy")
      .populate("itemId")
      .sort({ createdAt: -1 });

    return userpayments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user payments");
  }
};
export const getAdminpayments = async () => {
  try {
    const allpayments = await payments
      .find()
      .populate("paidBy")
      .populate("itemId")
      .sort({ createdAt: -1 });

    return allpayments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user payments");
  }
};

export const getPendingpayments = async (userId) => {
  try {
    const pendingpayments = await payments
      .find({
        paidBy: userId,
        status: "pending",
      })
      .populate("paidBy")
      .populate("itemId")
      .sort({ createdAt: -1 });

    return pendingpayments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user payments");
  }
};
export const getAllPayments = async (userId) => {
  try {
    const pendingpayments = await payments
      .find({
        paidBy: userId,
      })
      .populate("paidBy")
      .populate("itemId")
      .sort({ createdAt: -1 });

    return pendingpayments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user payments");
  }
};
export const getCompletepayments = async (userId) => {
  try {
    const completedpayments = await payments
      .find({
        paidBy: userId,
        status: "complete",
      })
      .populate("paidBy")
      .populate("itemId")
      .sort({ createdAt: -1 });

    return completedpayments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user payments");
  }
};
export const getExamsByAccessCode = async (code, userId) => {
  try {
    const exam = await payments
      .findOne({
        accessCode: code,
        paidBy: userId,
      })
      .populate("paidBy")
      .populate("itemId");

    if (!exam) {
      throw new Error("No exam not found with this access code.");
    }

    return exam;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve the exams by access code");
  }
};

export const getSingleUserpayments = async (userId, paymentsId) => {
  try {
    const payments = await payments
      .findOne({
        _id: paymentsId,
        paidBy: userId,
      })
      .populate({
        path: "itemId",
      });

    if (!payments) {
      throw new Error("payments not found or unauthorized access");
    }

    return payments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve the payments");
  }
};
