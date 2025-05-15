import Joi from "joi";

// Validation schema for user login
const loginUserSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

// Enhanced validation schema for user update
const updateUserSchema = Joi.object({
  companyName: Joi.string().optional(),
  tin: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .optional()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    }),
  currentPassword: Joi.string().when("password", {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  profile: Joi.string().optional(),
  fName: Joi.string().optional().min(3).max(30),
  lName: Joi.string().optional().min(3).max(30),
  idCard: Joi.string().optional().min(3).max(16),
  address: Joi.string().optional().min(3).max(100),
  phone: Joi.string()
    .optional()
    .pattern(/^[0-9]{10,15}$/),
  role: Joi.string().valid("student", "admin", "school").optional(),
}).with("password", "currentPassword");

// Function to validate user update
export const validateUpdateUser = (userData) => {
  return updateUserSchema.validate(userData, { abortEarly: false });
};

export const validateLoginUser = (userData) => {
  return loginUserSchema.validate(userData);
};
