import { Vehicle } from './Vehicle';
import { VehicleType } from '../types/enums';

export class ElectricVehicle extends Vehicle {
    private batteryCapacityKwh: number;
    private rangeKm: number;
    private batteryHealthPct: number;
    private chargerType: string;

    constructor(
        make: string,
        model: string,
        year: number,
        licensePlate: string,
        dailyRate: number,
        batteryCapacityKwh: number,
        rangeKm: number,
        chargerType: string,
        initialMileage: number = 0
    ) {
        super(make, model, year, licensePlate, dailyRate, 'HQ', initialMileage);
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.rangeKm = rangeKm;
        this.chargerType = chargerType;
        this.batteryHealthPct = 100; // New EVs start at 100% health
    }

    getVehicleType(): VehicleType {
        return VehicleType.ELECTRIC_VEHICLE;
    }

    getSpecifications(): Record<string, any> {
        return {
            battery: `${this.batteryCapacityKwh} kWh`,
            range: `${this.rangeKm} km`,
            charger: this.chargerType,
            batteryHealth: `${this.batteryHealthPct}%`,
        };
    }
}
