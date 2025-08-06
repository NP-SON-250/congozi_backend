import UnpaidAccounts from "../models/Congozi.unpaidaccounts.models";

export const getUserUnpaidAccounts = async (userId) => {
  try {
    const accounts = await UnpaidAccounts.find({
      paidBy: userId,
      status: "pending",
    })
      .populate({
        path: "account",
      })
      .sort({ createdAt: -1 });

    return accounts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user unpaid accounts");
  }
};

export const getSingleUserUnpaidAccounts = async (userId, id) => {
  try {
    const account = await UnpaidAccounts.findOne({
      _id: id,
      paidBy: userId,
    }).populate({
      path: "account",
    });

    if (!account) {
      throw new Error("Unpaid account not found or unauthorized access");
    }

    return account;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve the unpaid account");
  }
};
