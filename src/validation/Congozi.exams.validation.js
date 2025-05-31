import Joi from "joi";

//Create exams validation schema
const createExamSchema = Joi.object({
  number: Joi.string().required(),
  fees: Joi.string().required(),
  title: Joi.string().min(3).max(30).required(),
  type: Joi.string().valid("kora", "iga").required().min(3).max(30),
});
// Function to validate exam creation
export const validateCreateExam = (examData) => {
  return createExamSchema.validate(examData);
};
// Validation schema for exam update
const updateExamSchema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    type: Joi.string().min(3).max(30).valid("kora", "iga").optional(),
    number: Joi.string().optional(),
    fees: Joi.string().optional(),
});
// Function to validate exam update
export const validateUpdateExam = (examData) => {
  return updateExamSchema.validate(examData);
};
