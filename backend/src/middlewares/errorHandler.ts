import { Request, Response, NextFunction } from 'express';
import { AppError, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      createErrorResponse(err.code, err.message, err.details)
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', err.message)
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse('INVALID_TOKEN', 'Invalid authentication token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse('TOKEN_EXPIRED', 'Authentication token has expired')
    );
  }

  // Default error
  return res.status(500).json(
    createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? err.message : undefined
    )
  );
};

export default errorHandler;
