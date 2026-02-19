import { Vehicle } from '../../entities/Vehicle';

export interface VehicleState {
    reserve(vehicle: Vehicle): void;
    activate(vehicle: Vehicle): void;
    returnVehicle(vehicle: Vehicle): void;
    sendToMaintenance(vehicle: Vehicle): void;
    retire(vehicle: Vehicle): void;
    getStateName(): string;
}
