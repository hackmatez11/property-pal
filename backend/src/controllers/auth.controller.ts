import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { createSuccessResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role, companyName, contactPhone } = req.body;

      const result = await AuthService.signUp(
        email,
        password,
        role,
        companyName,
        contactPhone
      );

      res.status(201).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const authResponse = await AuthService.signIn(email, password);

      res.json(createSuccessResponse(authResponse));
    } catch (error) {
      next(error);
    }
  }

  async getAuthStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const authStatus = await AuthService.getAuthStatus(userId);

      res.json(createSuccessResponse(authStatus));
    } catch (error) {
      next(error);
    }
  }

  async getFeatureFlags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const featureFlags = await AuthService.getFeatureFlags(userId);

      res.json(createSuccessResponse(featureFlags));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
