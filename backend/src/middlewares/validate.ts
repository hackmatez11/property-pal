import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createErrorResponse } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors.array())
    );
  }

  next();
};

export default validate;
