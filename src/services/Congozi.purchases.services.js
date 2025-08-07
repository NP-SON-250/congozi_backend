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
import Notify from "../models/Congozi.notifies.models";
const generateAccessCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = letters[Math.floor(Math.random() * letters.length)];

  for (let i = 0; i < 11; i++) {
    code += alphanum[Math.floor(Math.random() * alphanum.length)];
  }

  return code;
};

export const makepayments = async (userId, userRole, itemId) => {
  try {
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
      throw new Error("Item not found in exams or accounts.");
    }
    if (userRole === "student" && itemType !== "exams") {
      throw new Error("Students are only allowed to payments exams.");
    }

    if (userRole === "school" && itemType !== "accounts") {
      throw new Error("Schools are only allowed to payments accounts.");
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
        paidBy: userId,
      });
    } else if (itemType === "accounts") {
      await TotalUserAccounts.create({
        account: itemId,
        accessCode: savedpayments.accessCode,
        paidBy: userId,
      });
    }

    return {
      message: `${itemType} has been paymentsd.`,
      payments: savedpayments,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error making payments: ${error.message}`);
  }
};
export const makePaidpayments = async (userId, userRole, itemId) => {
  try {
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
      throw new Error("Item not found in exams or accounts.");
    }
    if (userRole === "student" && itemType !== "exams") {
      throw new Error("Students are only allowed to payments exams.");
    }

    if (userRole === "school" && itemType !== "accounts") {
      throw new Error("Schools are only allowed to payments accounts.");
    }
    let endDate = null;
    if (itemType === "accounts") {
      const days = parseInt(item.validIn.replace(/\D/g, ""));
      endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
    }
    const savedpayments = await payments.create({
      itemType,
      itemId,
      paidBy: userId,
      amount: itemFees,
      accessCode: generateAccessCode(),
      startDate: new Date(),
      endDate,
    });
    let items = null;
    if (savedpayments.itemType === "exams") {
      items = await Exams.findById(savedpayments.itemId);
    } else if (savedpayments.itemType === "accounts") {
      items = await Accounts.findById(savedpayments.itemId);
    }
    if (itemType === "exams") {
      await WaittingExams.create({
        exam: itemId,
        accessCode: savedpayments.accessCode,
        paidBy: userId,
      });
    } else if (itemType === "accounts") {
      await WaittingAccounts.create({
        account: itemId,
        paidBy: userId,
      });
    }
    if (itemType === "exams") {
      await TotalUserExams.create({
        exam: itemId,
        accessCode: savedpayments.accessCode,
        paidBy: userId,
      });
    } else if (itemType === "accounts") {
      await TotalUserAccounts.create({
        account: itemId,
        paidBy: userId,
      });
    }

    return {
      message: `${itemType} has been paymentsd.`,
      payments: savedpayments,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error making payments: ${error.message}`);
  }
};
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

export const deleteUserpayments = async (paymentsId) => {
  try {
    const payments = await payments.findById(paymentsId);

    if (!payments) {
      throw new Error("payments not found");
    }

    const itemId = payments.itemId;
    await UnpaidExams.deleteMany({
      exam: itemId,
    });
    await WaittingExams.deleteMany({
      exam: itemId,
    });

    await PassedExams.deleteMany({
      exam: itemId,
    });
    await FailledExams.deleteMany({
      exam: itemId,
    });
    await ExpiredExams.deleteMany({
      exam: itemId,
    });
    await TotalUserExams.deleteMany({
      exam: itemId,
    });
    await WaittingAccounts.deleteMany({
      account: itemId,
    });
    await UnpaidAccounts.deleteMany({
      account: itemId,
    });
    await TotalUserAccounts.deleteMany({
      account: itemId,
    });
    await ExpiredAccounts.deleteMany({
      account: itemId,
    });
    await payments.findByIdAndDelete(paymentsId);

    return {
      message: "payments deleted",
      deletedpayments: payments,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the payments");
  }
};
export const deleteUserpaymentsByAccessCode = async (accessCode) => {
  try {
    const payment = await payments.findOne({ accessCode });

    if (!payment) {
      throw new Error("Payment not found");
    }
    const deletedPayment = await payments.deleteOne({ accessCode });

    await WaittingExams.deleteOne({ accessCode });

    return {
      message: "Payment and related waiting exam deleted",
      deletedPayment,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the payment by accessCode");
  }
};
