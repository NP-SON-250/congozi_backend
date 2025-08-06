import Notify from "../models/Congozi.notifies.models";
import UnpaidExams from "../models/Congozi.unpaidexams.models";
import UnpaidAccounts from "../models/Congozi.unpaidaccounts.models";
import payments from "../models/Congozi.payments.models";
export const allData = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const userRole = req.loggedInUser.role;

    let allnotes;

    if (userRole === "admin" || userRole === "supperAdmin") {
      allnotes = await Notify.find({ status: "Under Review" });
    } else {
      allnotes = await Notify.find({
        notifiedBy: userId,
        status: "Access Granted",
      }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      status: "200",
      message: "Notifications fetched",
      data: allnotes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo",
      error: error.message,
    });
  }
};
export const createNote = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const { message, noteTitle, purchasedItem, ownerName } = req.body;

    // Prevent duplicate notifications
    const isMessage = await Notify.findOne({
      message,
      notifiedBy: userId,
      purchasedItem: purchasedItem,
    });
    if (isMessage) {
      return res.status(400).json({
        status: 400,
        message: "Irimenyekanisha ryaroherejwe",
      });
    }

    // Create the new notification
    const createdNotes = await Notify.create({
      message,
      notifiedBy: userId,
      noteTitle,
      purchasedItem,
      ownerName,
    });

    // Check if it's a known payment and update corresponding unpaid item
    const purchasedData = await payments.findById(purchasedItem);
    if (purchasedData) {
      const query = {
        purchaseId: purchasedItem,
        paidBy: userId,
      };

      const update = { status: "waitingConfirmation" };

      if (purchasedData.itemType === "exams") {
        await UnpaidExams.findOneAndUpdate(query, update);
      } else if (purchasedData.itemType === "accounts") {
        await UnpaidAccounts.findOneAndUpdate(query, update);
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Kumenyekanisha inyemezabwishyu byakunze",
      data: createdNotes,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Habayemo ikibazo",
      error: error.message,
    });
  }
};

export const singleData = async (req, res) => {
  try {
    const { id } = req.params;
    const single = await Notify.findById(id);
    if (!single) {
      return res.status(404).json({
        status: "200",
        message: "Notification not found",
        data: allnotes,
      });
    }
    return res.status(200).json({
      status: "200",
      message: "Notifications fetched",
      data: single,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo",
      error: error.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const itemDelete = await Notify.findById(id);
    if (!itemDelete) {
      return res.status(404).json({
        status: "404",
        message: "Ububutumwa ntibubashije kuboneka",
      });
    }
    await Notify.findByIdAndDelete(id);
    return res.status(200).json({
      status: "200",
      message: "Ububutumwa bushyizwe mububiko",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "500",
      message: "Habayemo ikibazo",
      error: error.message,
    });
  }
};
