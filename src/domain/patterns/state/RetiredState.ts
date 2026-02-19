import { VehicleState } from './VehicleState.interface';
import { Vehicle } from '../../entities/Vehicle';

export class RetiredState implements VehicleState {
    reserve(vehicle: Vehicle): void {
        throw new Error('Vehicle is retired and cannot be reserved.');
    }

    activate(vehicle: Vehicle): void {
        throw new Error('Vehicle is retired.');
    }

    returnVehicle(vehicle: Vehicle): void {
        throw new Error('Vehicle is retired.');
    }

    sendToMaintenance(vehicle: Vehicle): void {
        throw new Error('Vehicle is retired.');
    }

    retire(vehicle: Vehicle): void {
        throw new Error('Vehicle is already retired.');
    }

    getStateName(): string {
        return 'RETIRED';
    }
}
