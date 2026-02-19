import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../../../infrastructure/Logger';
import { AppError } from '../../../domain/errors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    Logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: (err as any).errors
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Default to 500 Internal Server Error
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
};
