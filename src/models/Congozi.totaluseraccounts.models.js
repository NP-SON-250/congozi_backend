import mongoose from "mongoose";
const totalUserAccountsSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: { type: Date, default: Date.now },
});
const TotalUserAccounts =
  mongoose.model.totalUserAccounts ||
  mongoose.model("totalUserAccounts", totalUserAccountsSchema);
export default TotalUserAccounts;
