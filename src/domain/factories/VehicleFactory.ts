import { Car } from '../entities/Car';
import { Truck } from '../entities/Truck';
import { ElectricVehicle } from '../entities/ElectricVehicle';
import { Vehicle } from '../entities/Vehicle';
import { VehicleType } from '../types/enums';

export class VehicleFactory {
    static createVehicle(type: VehicleType, data: any): Vehicle {
        switch (type) {
            case VehicleType.CAR:
                return new Car(
                    data.make,
                    data.model,
                    data.year,
                    data.licensePlate,
                    data.dailyRate,
                    data.numDoors,
                    data.transmission,
                    data.fuelType,
                    data.seatingCapacity
                );
            case VehicleType.TRUCK:
                return new Truck(
                    data.make,
                    data.model,
                    data.year,
                    data.licensePlate,
                    data.dailyRate,
                    data.payloadCapacityTons,
                    data.truckClass,
                    data.hasRefrigeration
                );
            case VehicleType.ELECTRIC_VEHICLE:
                return new ElectricVehicle(
                    data.make,
                    data.model,
                    data.year,
                    data.licensePlate,
                    data.dailyRate,
                    data.batteryCapacityKwh,
                    data.rangeKm,
                    data.chargerType
                );
            default:
                throw new Error('Invalid vehicle type.');
        }
    }
}
