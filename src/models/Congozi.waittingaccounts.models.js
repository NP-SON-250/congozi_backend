import mongoose from "mongoose";
const waittingAccountsSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  accessCode: { type: String },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: { type: Date, default: Date.now },
});
const WaittingAccounts =
  mongoose.model.waittingAccounts ||
  mongoose.model("waittingAccounts", waittingAccountsSchema);
export default WaittingAccounts;
