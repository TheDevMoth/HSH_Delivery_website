import { body, validationResult, ValidationChain } from 'express-validator';
import express from 'express';

const newFirstameSchema: ValidationChain = body('firstname').trim().isLength({ min: 1 }).withMessage('firstname is required').isAlpha().withMessage('firstname must only contain letters');
const newMidinitSchema: ValidationChain = body('midinitial').trim().isAlpha().withMessage('Middle initial must be a letter').isLength({min:1, max:1}).withMessage('Middle initial must be a single letter');
const newLastameSchema: ValidationChain = body('lastname').trim().isLength({ min: 1 }).withMessage('lastname is required').isAlpha().withMessage('lastname must only contain letters');

const newAddressSchema: ValidationChain = body('address').trim().isLength({ min: 1 }).withMessage('address is required');

const newPasswordSchema: ValidationChain = body('password').trim()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one letter, one number, and one special character');

const emailSchema: ValidationChain = body('email').trim().normalizeEmail()
    .isEmail().withMessage('Email must be a valid email address');

const phoneNumberSchema: ValidationChain = body('phone').trim().isMobilePhone('any').withMessage('Phone number must be a valid phone number');

const sanitizePassword: ValidationChain = body('password').trim();
const sanitizeEmail: ValidationChain = body('email').trim();


const validate = (validations: ValidationChain[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    console.log(errors);
    res.status(400).render('register.html', { errors: errors.array(), body: req.body });
  };
};

export {
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
