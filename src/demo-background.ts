import request from 'supertest';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './infrastructure/Logger';
import { bootstrapBackgroundServices } from './infrastructure/bootstrap';
import { runMaintenanceCheckNow } from './infrastructure/scheduler/MaintenanceCron';

const prisma = new PrismaClient();
const agent = request(app);

async function runBackgroundDemo() {
    // Initialize background services (Observer subscriptions + queues)
    bootstrapBackgroundServices();
    Logger.info('=== Phase 3C: Background Tasks & Messaging Demo ===');

    try {
        // --- Test 1: Observer Pattern → Welcome Email on Customer Registration ---
        Logger.info('\n--- Test 1: Observer → Welcome Email ---');
        const uniqueEmail = `bg-test-${Date.now()}@example.com`;

        const regRes = await agent.post('/api/v1/auth/register').send({
            email: uniqueEmail,
            password: 'password123',
            firstName: 'Background',
            lastName: 'Tester'
        });
        Logger.info(`Registration: ${regRes.status}`);
        // Wait for the background job to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        Logger.info('✅ Test 1 Complete: Welcome email job should have been dispatched and processed above');

        // --- Test 2: RENTAL_CREATED → Receipt Email + Insurance Verification ---
        Logger.info('\n--- Test 2: Rental → Background Jobs (Receipt + Insurance) ---');

        const loginRes = await agent.post('/api/v1/auth/login').send({
            email: uniqueEmail,
            password: 'password123'
        });
        const token = loginRes.body.token;

        // Create a vehicle to rent
        const vehicleId = uuidv4();
        await prisma.vehicle.create({
            data: {
                vehicleId,
                make: 'Tesla',
                model: 'Model 3',
                year: 2024,
                licensePlate: `BG-${Date.now()}`,
                dailyRate: 120,
                mileageKm: 0,
                lastServiceMileage: 0,
                state: 'AVAILABLE',
                type: 'ELECTRIC_VEHICLE',
                batteryCapacityKwh: 75,
                rangeKm: 350,
                batteryHealthPct: 100,
                chargerType: 'Type 2',
            }
        });

        const rentalRes = await agent.post('/api/v1/rentals')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerId: uniqueEmail,
                vehicleId: vehicleId,
                startDate: new Date().toISOString(),
                days: 5,
                insuranceTier: 'PREMIUM'
            });

        Logger.info(`Rental creation: ${rentalRes.status}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        Logger.info('✅ Test 2 Complete: Receipt email + Insurance verification jobs processed above');

        // --- Test 3: CRON Maintenance Check ---
        Logger.info('\n--- Test 3: CRON Maintenance Check ---');

        // Create a high-mileage vehicle that needs maintenance
        const highMileageId = uuidv4();
        await prisma.vehicle.create({
            data: {
                vehicleId: highMileageId,
                make: 'Ford',
                model: 'F-150',
                year: 2022,
                licensePlate: `HM-${Date.now()}`,
                dailyRate: 80,
                mileageKm: 15000,
                lastServiceMileage: 5000, // 15000 - 5000 = 10000 > 5000 threshold
                state: 'AVAILABLE',
                type: 'TRUCK',
                payloadCapacityTons: 1.5,
                truckClass: 'Light',
                hasRefrigeration: false,
            }
        });

        const flaggedCount = await runMaintenanceCheckNow();
        Logger.info(`✅ Test 3 Complete: ${flaggedCount} vehicle(s) flagged for maintenance`);

        // Verify the vehicle state changed
        const updatedVehicle = await prisma.vehicle.findUnique({ where: { vehicleId: highMileageId } });
        Logger.info(`Vehicle state after CRON: ${updatedVehicle?.state} (expected: MAINTENANCE)`);

    } catch (error) {
        Logger.error('Demo failed', { error });
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

runBackgroundDemo();
