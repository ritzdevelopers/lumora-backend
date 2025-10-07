const { body, validationResult } = require('express-validator');

const ValidationEnquiry = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('mail').notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').trim(),
    body('phone').notEmpty().withMessage('Phone is required').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 digits').trim(),
    body('message').notEmpty().withMessage('Message is required').trim()
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = { ValidationEnquiry, handleValidationErrors };