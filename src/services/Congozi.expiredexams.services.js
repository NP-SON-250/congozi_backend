import ExpiredExams from "../models/Congozi.expiredexams.models";

export const getUserExpiredExams = async (userId) => {
  try {
    const exams = await ExpiredExams.find({ paidBy: userId })
      .populate({
        path: "exam",
      })
      .sort({ createdAt: -1 });

    return exams;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user expired exams");
  }
};
export const getSingleUserExpiredExams = async (userId, id) => {
  try {
    const exam = await ExpiredExams.findOne({
      _id: id,
      paidBy: userId,
    }).populate({
      path: "exam",
    });

    if (!exam) {
      throw new Error("Expired exam not found or unauthorized access");
    }

    return exam;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve the expired exam");
  }
};
