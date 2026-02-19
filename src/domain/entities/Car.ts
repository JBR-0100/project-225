import { Vehicle } from './Vehicle';
import { VehicleType } from '../types/enums';

export class Car extends Vehicle {
    private numDoors: number;
    private transmission: string;
    private fuelType: string;
    private seatingCapacity: number;

    constructor(
        make: string,
        model: string,
        year: number,
        licensePlate: string,
        dailyRate: number,
        numDoors: number,
        transmission: 'Manual' | 'Automatic',
        fuelType: 'Petrol' | 'Diesel' | 'Hybrid',
        seatingCapacity: number
    ) {
        super(make, model, year, licensePlate, dailyRate);
        this.numDoors = numDoors;
        this.transmission = transmission;
        this.fuelType = fuelType;
        this.seatingCapacity = seatingCapacity;
    }

    getVehicleType(): VehicleType {
        return VehicleType.CAR;
    }

    getSpecifications(): Record<string, any> {
        return {
            doors: this.numDoors,
            transmission: this.transmission,
            fuel: this.fuelType,
            seats: this.seatingCapacity,
        };
    }
}
