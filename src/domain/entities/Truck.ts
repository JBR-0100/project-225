import { Vehicle } from './Vehicle';
import { VehicleType } from '../types/enums';

export class Truck extends Vehicle {
    private payloadCapacityTons: number;
    private truckClass: string;
    private hasRefrigeration: boolean;

    constructor(
        make: string,
        model: string,
        year: number,
        licensePlate: string,
        dailyRate: number,
        payloadCapacityTons: number,
        truckClass: string,
        hasRefrigeration: boolean
    ) {
        super(make, model, year, licensePlate, dailyRate);
        this.payloadCapacityTons = payloadCapacityTons;
        this.truckClass = truckClass;
        this.hasRefrigeration = hasRefrigeration;
    }

    getVehicleType(): VehicleType {
        return VehicleType.TRUCK;
    }

    getSpecifications(): Record<string, any> {
        return {
            payloadCapacity: `${this.payloadCapacityTons} tons`,
            class: this.truckClass,
            refrigerated: this.hasRefrigeration,
        };
    }
}
