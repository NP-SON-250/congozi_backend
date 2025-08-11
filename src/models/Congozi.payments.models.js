import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["exams", "accounts"] },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "itemType",
  },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  amount: { type: String },
  accessCode: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "complete", "waitingConfirmation", "expired"],
    default: "pending",
  },
});

const payments =
  mongoose.model.payments || mongoose.model("payments", paymentSchema);
export default payments;
