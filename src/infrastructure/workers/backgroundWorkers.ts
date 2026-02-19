import { Logger } from '../../infrastructure/Logger';

/**
 * Background job workers for asynchronous task processing.
 * These simulate real email/PDF/verification services.
 */

/** Generates and "sends" a PDF receipt for a completed rental */
export async function emailReceiptWorker(data: { contractId: string; customerEmail: string; totalAmount: number }): Promise<void> {
    Logger.info(`[Worker] Generating PDF receipt for contract ${data.contractId}...`);
    // Simulate async PDF generation (network call, file I/O, etc.)
    await new Promise(resolve => setTimeout(resolve, 500));
    Logger.info(`[Worker] ✅ Receipt emailed to ${data.customerEmail} | Amount: $${data.totalAmount}`, {
        contractId: data.contractId,
        email: data.customerEmail,
    });
}

/** Verifies insurance policy validity with an external provider */
export async function insuranceVerificationWorker(data: { policyTier: string; contractId: string }): Promise<void> {
    Logger.info(`[Worker] Verifying insurance (${data.policyTier}) for contract ${data.contractId}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    Logger.info(`[Worker] ✅ Insurance verified: ${data.policyTier} tier accepted`, {
        contractId: data.contractId,
        tier: data.policyTier,
    });
}

/** Sends a welcome email to a newly registered customer */
export async function welcomeEmailWorker(data: { customerId: string; email: string; firstName: string }): Promise<void> {
    Logger.info(`[Worker] Sending welcome email to ${data.email}...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    Logger.info(`[Worker] ✅ Welcome email sent to ${data.firstName} (${data.email})`, {
        customerId: data.customerId,
    });
}
