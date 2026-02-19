import { VehicleState } from './VehicleState.interface';
import { Vehicle } from '../../entities/Vehicle';
import { AvailableState } from './AvailableState';

export class RentedState implements VehicleState {
    reserve(vehicle: Vehicle): void {
        throw new Error('Vehicle is currently rented.');
    }

    activate(vehicle: Vehicle): void {
        throw new Error('Vehicle is already active.');
    }

    returnVehicle(vehicle: Vehicle): void {
        console.log('Vehicle returned.');
        vehicle.setState(new AvailableState());
    }

    sendToMaintenance(vehicle: Vehicle): void {
        throw new Error('Cannot send rented vehicle to maintenance. It must be returned first.');
    }

    retire(vehicle: Vehicle): void {
        throw new Error('Cannot retire a rented vehicle.');
    }

    getStateName(): string {
        return 'RENTED';
    }
}
