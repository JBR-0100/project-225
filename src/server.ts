import app from './app';
import { PrismaClient } from '@prisma/client';
import { Logger } from './infrastructure/Logger';
import { bootstrapBackgroundServices } from './infrastructure/bootstrap';

bootstrapBackgroundServices();

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

const server = app.listen(Number(PORT), '0.0.0.0', () => {
    Logger.info(`Server is running on port ${PORT} at 0.0.0.0`);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
    Logger.info('Received shutdown signal. Closing HTTP server...');

    server.close(async () => {
        Logger.info('HTTP server closed.');

        try {
            await prisma.$disconnect();
            Logger.info('Database connection closed.');
            process.exit(0);
        } catch (err) {
            Logger.error('Error during database disconnection', { error: err });
            process.exit(1);
        }
    });

    // Force close if it takes too long
    setTimeout(() => {
        Logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}
