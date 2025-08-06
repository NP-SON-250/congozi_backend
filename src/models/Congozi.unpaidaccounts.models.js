import mongoose from "mongoose";
const unpaidAccountsSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "payments" },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  status:{type:String},
  createdAt: { type: Date, default: Date.now },
});
const UnpaidAccounts =
  mongoose.model.unpaidAccounts ||
  mongoose.model("unpaidAccounts", unpaidAccountsSchema);
export default UnpaidAccounts;
