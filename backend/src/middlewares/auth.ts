import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabase';
import { AppError } from '../utils/response';
import { UserRole, AuthResponse } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No authentication token provided');
    }

    const token = authHeader.substring(7);
    const supabase = createSupabaseClient(token);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid authentication token');
    }

    // Fetch user profile to get role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AppError(401, 'UNAUTHORIZED', 'User profile not found');
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          'FORBIDDEN',
          `Access denied. Required roles: ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const supabase = createSupabaseClient(token);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        req.user = {
          id: user.id,
          email: user.email!,
          role: profile.role,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};
