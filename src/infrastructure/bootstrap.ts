import { JobQueue } from './queue/JobQueue';
import { EventBus, DomainEvents } from './events/EventBus';
import { emailReceiptWorker, insuranceVerificationWorker, welcomeEmailWorker } from './workers/backgroundWorkers';
import { startMaintenanceCron } from './scheduler/MaintenanceCron';
import { Logger } from './Logger';

// Singleton queues
export const emailQueue = new JobQueue('email-queue');
export const verificationQueue = new JobQueue('verification-queue');

/**
 * Bootstrap all background infrastructure:
 * 1. Register job handlers with queues
 * 2. Subscribe to domain events (Observer Pattern)
 * 3. Start CRON schedulers
 */
export function bootstrapBackgroundServices(): void {
    Logger.info('Bootstrapping background services...');

    // 1. Register job handlers
    emailQueue.registerHandler('send-receipt', emailReceiptWorker);
    emailQueue.registerHandler('send-welcome', welcomeEmailWorker);
    verificationQueue.registerHandler('verify-insurance', insuranceVerificationWorker);

    // 2. Observer Pattern: Subscribe to domain events
    EventBus.subscribe(DomainEvents.CUSTOMER_CREATED, async (data) => {
        await emailQueue.addJob('send-welcome', data);
    });

    EventBus.subscribe(DomainEvents.RENTAL_CREATED, async (data) => {
        await emailQueue.addJob('send-receipt', {
            contractId: data.contractId,
            customerEmail: data.customerEmail,
            totalAmount: data.totalAmount,
        });
        await verificationQueue.addJob('verify-insurance', {
            contractId: data.contractId,
            policyTier: data.insuranceTier,
        });
    });

    // 3. Start CRON scheduler
    startMaintenanceCron();

    Logger.info('✅ Background services bootstrapped successfully');
}
