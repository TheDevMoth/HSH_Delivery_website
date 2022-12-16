const { body, validationResult } = require('express-validator');

const newFirstameSchema = body('firstname').trim().isLength({ min: 1 }).withMessage('firstname is required').isAlpha().withMessage('firstname must only contain letters');
const newMidinitSchema = body('midinitial').trim().isAlpha().withMessage('Middle initial must be a letter').isLength({min:1, max:1}).withMessage('Middle initial must be a single letter');
const newLastameSchema = body('lastname').trim().isLength({ min: 1 }).withMessage('lastname is required').isAlpha().withMessage('lastname must only contain letters');

const newAddressSchema = body('address').trim().isLength({ min: 1 }).withMessage('address is required');

const newPasswordSchema = body('password').trim()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one letter, one number, and one special character');

const emailSchema = body('email').trim().normalizeEmail()
    .isEmail().withMessage('Email must be a valid email address');

const phoneNumberSchema = body('phone').trim().isMobilePhone('any').withMessage('Phone number must be a valid phone number');

const sanitizePassword = body('password').trim();
const sanitizeEmail = body('email').trim();


const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    console.log(errors);
    res.status(400).render('register.html', { errors: errors.array(), body: req.body });
  };
};

module.exports = {
    newFirstameSchema,
    newLastameSchema,
    newMidinitSchema,
    newPasswordSchema,
    emailSchema,
    newAddressSchema,
    sanitizePassword,
    sanitizeEmail,
    phoneNumberSchema,
    validate
};
