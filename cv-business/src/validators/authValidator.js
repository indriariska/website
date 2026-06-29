const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('admin', 'super_admin').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.name = 'ValidationError';
    err.details = error.details;
    return next(err);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.name = 'ValidationError';
    err.details = error.details;
    return next(err);
  }
  next();
};

module.exports = { validateRegister, validateLogin };
