import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export const roleMiddleware = (requiredRole: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ status: 'error', message: 'Access denied: Insufficient permissions' });
    }
    next();
};
