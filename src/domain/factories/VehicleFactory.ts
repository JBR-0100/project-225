import { Car } from '../entities/Car';
import { Truck } from '../entities/Truck';
import { ElectricVehicle } from '../entities/ElectricVehicle';
import { Vehicle } from '../entities/Vehicle';
import { VehicleType } from '../types/enums';

export class VehicleFactory {
    static createVehicle(type: VehicleType, data: any): Vehicle {
        // Explicitly extract and cast each property before passing to constructor
        // This avoids complex inline casting that might confuse the compiler
        const make = String(data.make);
        const model = String(data.model);
        const year = Number(data.year);
        const licensePlate = String(data.licensePlate);
        const dailyRate = Number(data.dailyRate);

        switch (type) {
            case VehicleType.CAR: {
                const numDoors = Number(data.numDoors || 4);
                const transmission = String(data.transmission || 'Manual') as 'Manual' | 'Automatic';
                const fuelType = String(data.fuelType || 'Petrol') as 'Petrol' | 'Diesel' | 'Hybrid';
                const seatingCapacity = Number(data.seatingCapacity || 5);

                // @ts-ignore
                return new Car(
                    make, model, year, licensePlate, dailyRate,
                    numDoors, transmission, fuelType, seatingCapacity
                );
            }
            case VehicleType.TRUCK: {
                const payload = Number(data.payloadCapacityTons || 0);
                const truckClass = String(data.truckClass || 'Light Duty');
                const refrigeration = Boolean(data.hasRefrigeration);

                return new Truck(
                    make, model, year, licensePlate, dailyRate,
                    payload, truckClass, refrigeration
                );
            }
            case VehicleType.ELECTRIC_VEHICLE: {
                const capacity = Number(data.batteryCapacityKwh || 0);
                const range = Number(data.rangeKm || 0);
                const charger = String(data.chargerType || 'Standard');

                return new ElectricVehicle(
                    make, model, year, licensePlate, dailyRate,
                    capacity, range, charger
                );
            }
            default:
                throw new Error('Invalid vehicle type.');
        }
    }
}
