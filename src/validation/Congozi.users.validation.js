import Joi from "joi";

const loginUserSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

export const validateLoginUser = (userData) => {
  return loginUserSchema.validate(userData);
};

const updateUserSchema = Joi.object({
  companyName: Joi.string().allow('', null).optional(),
  tin: Joi.string().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  password: Joi.string().allow('', null).optional(),
  profile: Joi.string().allow('', null).optional(),
  fName: Joi.string().min(3).max(30).allow('', null).optional(),
  lName: Joi.string().min(3).max(30).allow('', null).optional(),
  idCard: Joi.string().min(3).max(16).allow('', null).optional(),
  address: Joi.string().min(3).max(30).allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  role: Joi.string().valid("student", "admin", "school", "supperAdmin").optional(),
}).min(1);

export const validateUpdateUser = (userData) => {
  return updateUserSchema.validate(userData, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
};