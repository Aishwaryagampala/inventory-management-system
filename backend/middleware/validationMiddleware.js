const Joi = require("joi");

const emailSchema = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    return Joi.string().min(1).required().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
    });
  } else {
    return Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    });
  }
};

const loginSchema = Joi.object({
  email: emailSchema(),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  rememberMe: Joi.boolean().optional(),
});

const addUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must not exceed 50 characters",
    "any.required": "Username is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  email: emailSchema(),
  user_role: Joi.string().valid("admin", "staff").required().messages({
    "any.only": "Role must be either admin or staff",
    "any.required": "User role is required",
  }),
});

const addProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Product name cannot be empty",
    "string.max": "Product name must not exceed 255 characters",
    "any.required": "Product name is required",
  }),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().allow("", null).optional(),
  price: Joi.number().min(0).required().messages({
    "number.min": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    "number.min": "Quantity must be a positive number",
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),
  sku: Joi.string().min(1).max(100).required().messages({
    "string.empty": "SKU cannot be empty",
    "string.max": "SKU must not exceed 100 characters",
    "any.required": "SKU is required",
  }),
  barcode: Joi.string().allow("", null).optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().allow("", null).optional(),
  price: Joi.number().min(0).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  sku: Joi.string().min(1).max(100).optional(),
  barcode: Joi.string().allow("", null).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  loginSchema,
  addUserSchema,
  addProductSchema,
  updateProductSchema,
};
