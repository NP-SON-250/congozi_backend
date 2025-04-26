import Accounts from "../models/Congozi.accounts.models";

// Service to create account
export const createAccount = async (accountData) => {
  const { title, validIn, fees, grantedexams } = accountData;

  try {
    // Check if account with same number and same type already exists
    const existingAccount = await Accounts.findOne({ title });
    if (existingAccount) {
      throw new Error("This account already exists");
    }

    // Create the account
    const account = await Accounts.create({
      title,
      fees,
      validIn,
      grantedexams,
    });

    return {
      message: "Account recorded",
      Account: account,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating account: ${error.message}`);
  }
};

// Service to update an account
export const updateAccount = async (id, accountData) => {
  const { title } = accountData;

  try {
    const accountExist = await Accounts.findById(id);
    if (!accountExist) {
      throw new Error("Account not found");
    }

    // If number is being updated (but not type)
    if (title) {
      const duplicate = await Accounts.findOne({
        title,
        _id: { $ne: id },
      });

      if (duplicate) {
        throw new Error(
          "An account type exist"
        );
      }
    }
    const updatedAccount = await Accounts.findByIdAndUpdate(id, accountData, {
      new: true,
    });

    return updatedAccount;
  } catch (error) {
    throw new Error(`Error updating account: ${error.message}`);
  }
};

// Service to delete an account
export const deleteAccount = async (id) => {
  try {
    const isExist = await Accounts.findById(id);
    if (!isExist) {
      throw new Error("Account not found");
    }
    await Accounts.findByIdAndDelete(id);
    return {
      message: "Account deleted",
      deletedAccount: isExist,
    };
  } catch (error) {
    throw new Error(`Error deleting account: ${error.message}`);
  }
};
// Service to get all account
export const getAllAccount = async () => {
  try {
    const allAccounts = await Accounts.find();
    return allAccounts;
  } catch (error) {
    throw new Error(`Error retrieving account: ${error.message}`);
  }
};
// Service to get single account
export const getAccountById = async (id) => {
  try {
    const isExist = await Accounts.findById(id);
    if (!isExist) {
      throw new Error("Account not found");
    }
    return isExist;
  } catch (error) {
    throw new Error(`Error retrieving account: ${error.message}`);
  }
};
