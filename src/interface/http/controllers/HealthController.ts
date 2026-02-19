import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../../infrastructure/Logger';

const prisma = new PrismaClient();

export class HealthController {
    async check(req: Request, res: Response) {
        try {
            // Check Database Connection
            await prisma.$queryRaw`SELECT 1`;

            res.status(200).json({
                status: 'UP',
                timestamp: new Date().toISOString(),
                database: 'connected'
            });
        } catch (error) {
            Logger.error('Health check failed', { error });
            res.status(503).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                database: 'disconnected'
            });
        }
    }
}
