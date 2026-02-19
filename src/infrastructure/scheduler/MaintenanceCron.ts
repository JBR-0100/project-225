import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../infrastructure/Logger';

const prisma = new PrismaClient();
const MAINTENANCE_THRESHOLD_KM = 5000;

/**
 * CRON Job: Runs daily at midnight.
 * Finds vehicles where mileageKm > lastServiceMileage + 5000
 * and transitions them to MAINTENANCE state.
 */
export function startMaintenanceCron(): void {
    Logger.info('🕐 Maintenance CRON scheduler started (runs daily at midnight)');

    cron.schedule('0 0 * * *', async () => {
        Logger.info('[CRON] Running daily maintenance check...');

        try {
            const vehiclesNeedingService = await prisma.vehicle.findMany({
                where: {
                    deletedAt: null,
                    state: 'AVAILABLE', // Only check available vehicles
                },
            });

            const flagged = vehiclesNeedingService.filter(
                v => v.mileageKm > v.lastServiceMileage + MAINTENANCE_THRESHOLD_KM
            );

            if (flagged.length === 0) {
                Logger.info('[CRON] No vehicles require maintenance today.');
                return;
            }

            Logger.info(`[CRON] Found ${flagged.length} vehicles requiring maintenance`);

            for (const vehicle of flagged) {
                await prisma.vehicle.update({
                    where: { vehicleId: vehicle.vehicleId },
                    data: {
                        state: 'MAINTENANCE',
                        lastServiceMileage: vehicle.mileageKm,
                    },
                });

                Logger.info(`[CRON] Vehicle ${vehicle.vehicleId} (${vehicle.make} ${vehicle.model}) → MAINTENANCE`, {
                    vehicleId: vehicle.vehicleId,
                    mileage: vehicle.mileageKm,
                    lastService: vehicle.lastServiceMileage,
                });
            }
        } catch (error) {
            Logger.error('[CRON] Maintenance check failed', { error });
        }
    });
}

/**
 * Run the maintenance check immediately (for testing/demo purposes).
 */
export async function runMaintenanceCheckNow(): Promise<number> {
    Logger.info('[CRON] Running immediate maintenance check...');

    const vehiclesNeedingService = await prisma.vehicle.findMany({
        where: {
            deletedAt: null,
            state: 'AVAILABLE',
        },
    });

    const flagged = vehiclesNeedingService.filter(
        v => v.mileageKm > v.lastServiceMileage + MAINTENANCE_THRESHOLD_KM
    );

    for (const vehicle of flagged) {
        await prisma.vehicle.update({
            where: { vehicleId: vehicle.vehicleId },
            data: {
                state: 'MAINTENANCE',
                lastServiceMileage: vehicle.mileageKm,
            },
        });

        Logger.info(`[CRON] Vehicle ${vehicle.vehicleId} → MAINTENANCE (mileage: ${vehicle.mileageKm}km)`);
    }

    return flagged.length;
}
