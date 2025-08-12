import UnpaidExams from "../models/Congozi.unpaidexams.models";

export const getUserUnpaidExams = async (userId) => {
  try {
    const exams = await UnpaidExams.find({ paidBy: userId, status: "pending" })
      .populate({
        path: "exam",
      })
      .sort({ createdAt: -1 });

    return exams;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user unpaid exams");
  }
};
export const getSingleUserUnpaidExam = async (userId, id) => {
  try {
    const exam = await UnpaidExams.findOne({
      _id: id,
      paidBy: userId,
    }).populate({
      path: "exam",
    });

    if (!exam) {
      throw new Error("Unpaid exam not found or unauthorized access");
    }

    return exam;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve the unpaid exam");
  }
};
