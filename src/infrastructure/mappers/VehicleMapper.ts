import { Vehicle as PrismaVehicle } from '@prisma/client';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Car } from '../../domain/entities/Car';
import { Truck } from '../../domain/entities/Truck';
import { ElectricVehicle } from '../../domain/entities/ElectricVehicle';
import { VehicleType } from '../../domain/types/enums';
import { VehicleFactory } from '../../domain/factories/VehicleFactory';
import { AvailableState } from '../../domain/patterns/state/AvailableState';
import { ReservedState } from '../../domain/patterns/state/ReservedState';
import { RentedState } from '../../domain/patterns/state/RentedState';
import { MaintenanceState } from '../../domain/patterns/state/MaintenanceState';
import { RetiredState } from '../../domain/patterns/state/RetiredState';

export class VehicleMapper {
    static toDomain(prismaVehicle: PrismaVehicle): Vehicle {
        let type: VehicleType;

        // Map string type to Enum
        switch (prismaVehicle.type) {
            case 'CAR': type = VehicleType.CAR; break;
            case 'TRUCK': type = VehicleType.TRUCK; break;
            case 'ELECTRIC_VEHICLE': type = VehicleType.ELECTRIC_VEHICLE; break;
            default: throw new Error(`Unknown vehicle type: ${prismaVehicle.type}`);
        }

        const data: any = {
            make: prismaVehicle.make,
            model: prismaVehicle.model,
            year: prismaVehicle.year,
            licensePlate: prismaVehicle.licensePlate,
            dailyRate: prismaVehicle.dailyRate,
            // Specific fields (Use ! assertions or defaults as we expect data integrity for valid types)
            numDoors: prismaVehicle.numDoors,
            transmission: prismaVehicle.transmission,
            fuelType: prismaVehicle.fuelType,
            seatingCapacity: prismaVehicle.seatingCapacity,
            payloadCapacityTons: prismaVehicle.payloadCapacityTons,
            truckClass: prismaVehicle.truckClass,
            hasRefrigeration: prismaVehicle.hasRefrigeration,
            batteryCapacityKwh: prismaVehicle.batteryCapacityKwh,
            rangeKm: prismaVehicle.rangeKm,
            chargerType: prismaVehicle.chargerType
        };

        // @ts-ignore
        const vehicle = VehicleFactory.createVehicle(type, data);

        // Restore ID and Mileage which are not in constructor
        (vehicle as any).vehicleId = prismaVehicle.vehicleId;
        (vehicle as any).mileageKm = prismaVehicle.mileageKm;

        // Restore State
        switch (prismaVehicle.state) {
            case 'AVAILABLE': vehicle.setState(new AvailableState()); break;
            case 'RESERVED': vehicle.setState(new ReservedState()); break;
            case 'RENTED': vehicle.setState(new RentedState()); break;
            case 'MAINTENANCE': vehicle.setState(new MaintenanceState()); break;
            case 'RETIRED': vehicle.setState(new RetiredState()); break;
        }

        return vehicle;
    }
}
