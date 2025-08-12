import mongoose from "mongoose";
const totalUserExamsSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "exams" },
  accessCode: { type: String },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "payments" },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: { type: Date, default: Date.now },
});
const TotalUserExams =
  mongoose.model.totalUserExams ||
  mongoose.model("totalUserExams", totalUserExamsSchema);
export default TotalUserExams;
