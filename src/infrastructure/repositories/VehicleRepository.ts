import { PrismaClient } from '@prisma/client';
import { Vehicle } from '../../domain/entities/Vehicle';
import { VehicleMapper } from '../mappers/VehicleMapper';
import { PrismaService } from '../PrismaService';
import { VehicleType } from '../../domain/types/enums';

export class VehicleRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async save(vehicle: Vehicle): Promise<void> {
        const data = {
            vehicleId: vehicle.getVehicleId(), // Ensure ID is preserved
            make: vehicle.getMake(),
            model: vehicle.getModel(),
            year: vehicle.getYear(),
            licensePlate: vehicle.getLicensePlate(),
            dailyRate: vehicle.getDailyRate(),
            location: vehicle.getLocation(),
            mileageKm: vehicle.getMileage(),
            state: vehicle.getState().getStateName(),
            type: vehicle.getVehicleType().toString(),
            // Specifics (using simple casting for demo, ideally would use type guards)
            ...(vehicle as any).numDoors && { numDoors: (vehicle as any).numDoors },
            ...(vehicle as any).transmission && { transmission: (vehicle as any).transmission },
            ...(vehicle as any).fuelType && { fuelType: (vehicle as any).fuelType },
            ...(vehicle as any).seatingCapacity && { seatingCapacity: (vehicle as any).seatingCapacity },
            ...(vehicle as any).payloadCapacityTons && { payloadCapacityTons: (vehicle as any).payloadCapacityTons },
            ...(vehicle as any).truckClass && { truckClass: (vehicle as any).truckClass },
            ...(vehicle as any).hasRefrigeration && { hasRefrigeration: (vehicle as any).hasRefrigeration },
            ...(vehicle as any).batteryCapacityKwh && { batteryCapacityKwh: (vehicle as any).batteryCapacityKwh },
            ...(vehicle as any).rangeKm && { rangeKm: (vehicle as any).rangeKm },
            ...(vehicle as any).chargerType && { chargerType: (vehicle as any).chargerType },
        };

        await this.prisma.vehicle.upsert({
            where: { vehicleId: vehicle.getVehicleId() },
            update: data,
            create: data,
        });
    }

    async findAvailableByDate(startDate: Date, endDate: Date): Promise<Vehicle[]> {
        // 1. Find vehicles that are NOT soft deleted
        // 2. Find vehicles that do NOT have conflicting ACTIVE/CONFIRMED contracts
        // Note: This simple query finds all non-deleted vehicles. 
        // Real availability check often requires checking the Contracts table for overlaps.

        // Step 1: Get all active vehicles
        const vehicles = await this.prisma.vehicle.findMany({
            where: {
                deletedAt: null, // SOFT DELETE CHECK
                state: 'AVAILABLE', // Only currently available ones
            },
        });

        // Step 2: Check for conflicting contracts (In-memory filter for demo simplicity)
        // Ideally this should be a raw SQL or complex WHERE clause
        // For this phase, we'll assume state management handles immediate availability

        return vehicles.map(v => VehicleMapper.toDomain(v));
    }

    async findById(id: string): Promise<Vehicle | null> {
        const v = await this.prisma.vehicle.findFirst({
            where: {
                vehicleId: id,
                deletedAt: null
            }
        });
        if (!v) return null;
        return VehicleMapper.toDomain(v);
    }

    async delete(id: string): Promise<void> {
        // SOFT DELETE IMPLEMENTATION
        await this.prisma.vehicle.update({
            where: { vehicleId: id },
            data: { deletedAt: new Date() },
        });
        console.log(`Soft deleted vehicle ${id}`);
    }
}
