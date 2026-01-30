import { body, param, query, ValidationChain } from 'express-validator';
import { PropertyType, PropertyStatus, SubscriptionPlan } from '../types';

export const authValidation = {
  signUp: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['dealer', 'guest']),
    body('companyName').optional().isString().trim(),
    body('contactPhone').optional().isMobilePhone('any'),
  ],
  signIn: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
};

export const propertyValidation = {
  create: [
    body('title').isString().trim().isLength({ min: 10, max: 200 }),
    body('description').isString().trim().isLength({ min: 50, max: 5000 }),
    body('price').isFloat({ min: 0 }),
    body('location').isString().trim(),
    body('city').isString().trim(),
    body('state').isString().trim(),
    body('pincode').isString().trim().isLength({ min: 6, max: 6 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('size').isFloat({ min: 0 }),
    body('size_unit').isIn(['sqft', 'sqm', 'acres']),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('property_type').isIn(Object.values(PropertyType)),
    body('amenities').isArray(),
    body('amenities.*').isString(),
  ],
  update: [
    param('id').isUUID(),
    body('title').optional().isString().trim().isLength({ min: 10, max: 200 }),
    body('description').optional().isString().trim().isLength({ min: 50, max: 5000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().isString().trim().isLength({ min: 6, max: 6 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('size').optional().isFloat({ min: 0 }),
    body('size_unit').optional().isIn(['sqft', 'sqm', 'acres']),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('property_type').optional().isIn(Object.values(PropertyType)),
    body('amenities').optional().isArray(),
    body('status').optional().isIn(Object.values(PropertyStatus)),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('city').optional().isString(),
    query('state').optional().isString(),
    query('property_type').optional().isIn(Object.values(PropertyType)),
    query('min_price').optional().isFloat({ min: 0 }).toFloat(),
    query('max_price').optional().isFloat({ min: 0 }).toFloat(),
    query('min_size').optional().isFloat({ min: 0 }).toFloat(),
    query('max_size').optional().isFloat({ min: 0 }).toFloat(),
    query('bedrooms').optional().isInt({ min: 0 }).toInt(),
    query('bathrooms').optional().isInt({ min: 0 }).toInt(),
    query('sortBy').optional().isIn(['price', 'size', 'created_at']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  get: [param('id').isUUID()],
  delete: [param('id').isUUID()],
};

export const subscriptionValidation = {
  create: [
    body('plan').isIn(Object.values(SubscriptionPlan)),
    body('paymentMethodId').isString(),
  ],
  cancel: [
    param('id').isUUID(),
  ],
};

export const leadValidation = {
  create: [
    body('property_id').isUUID(),
    body('user_name').isString().trim().isLength({ min: 2, max: 100 }),
    body('user_email').isEmail().normalizeEmail(),
    body('user_phone').isMobilePhone('any'),
    body('message').optional().isString().trim().isLength({ max: 1000 }),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('property_id').optional().isUUID(),
  ],
};

export const aiSearchValidation = {
  search: [
    body('query').isString().trim().isLength({ min: 5, max: 500 }),
    body('context').optional().isObject(),
  ],
};
