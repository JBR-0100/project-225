import request from 'supertest';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { Logger } from './infrastructure/Logger';

const prisma = new PrismaClient();
const agent = request(app);

async function runVerification() {
    Logger.info('Starting Resilience Verification (Phase 3B)...');

    try {
        // 1. Health Check
        Logger.info('Verifying Health Check (/api/v1/health)...');
        const healthRes = await agent.get('/api/v1/health');
        if (healthRes.status === 200 && healthRes.body.status === 'UP') {
            Logger.info('✅ Health Check Passed');
        } else {
            Logger.error('❌ Health Check Failed', { status: healthRes.status, body: healthRes.body });
        }

        // 2. Error Handling (404 Not Found)
        Logger.info('Verifying 404 Error Handling...');
        const notFoundRes = await agent.get('/api/v1/non-existent-route');
        if (notFoundRes.status === 404) {
            Logger.info('✅ 404 Handling Passed (Default Express behavior)');
        } else {
            // Express might return HTML for 404 by default if not handled explicitly, but let's see.
            Logger.warn('⚠️ 404 Handling response', { status: notFoundRes.status });
        }

        // 3. Structured Logging & Business Logic Error
        // Try to rent a non-existent vehicle to trigger AppError (404) and see logs
        Logger.info('Verifying Business Logic Error Handling...');

        // Login first to get token
        // Use existing customer from previous demo or create new?
        // Let's create a new temporary customer for this test to be self-contained
        const uniqueEmail = `resilience-test-${Date.now()}@example.com`;
        await agent.post('/api/v1/auth/register').send({
            email: uniqueEmail,
            password: 'password123',
            firstName: 'Resilience',
            lastName: 'Tester'
        });

        const loginRes = await agent.post('/api/v1/auth/login').send({
            email: uniqueEmail,
            password: 'password123'
        });
        const token = loginRes.body.token;

        const errorRes = await agent.post('/api/v1/rentals')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerId: uniqueEmail,
                vehicleId: '00000000-0000-0000-0000-000000000000', // Valid UUID but non-existent
                startDate: new Date().toISOString(),
                days: 3,
                insuranceTier: 'BASIC'
            });

        if (errorRes.status === 404 && errorRes.body.status === 'error') {
            Logger.info('✅ Business Logic Error Handling Passed (404 JSON received)');
        } else {
            Logger.error('❌ Business Logic Error Handling Failed', { status: errorRes.status, body: errorRes.body });
        }

    } catch (error) {
        Logger.error('❌ Usage Script Failed', { error });
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
