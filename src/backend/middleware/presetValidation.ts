import { Request, Response, NextFunction } from 'express';
import {
  validateCreatePresetRequest,
  CreatePresetRequest,
} from '../utils/presetHelpers';

export const validateCreatePresetFromLogs = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validateCreatePresetRequest(req.body as CreatePresetRequest);

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};
