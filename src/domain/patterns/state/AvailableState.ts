import { VehicleState } from './VehicleState.interface';
import { Vehicle } from '../../entities/Vehicle';
import { ReservedState } from './ReservedState';
import { MaintenanceState } from './MaintenanceState';
import { RetiredState } from './RetiredState';

export class AvailableState implements VehicleState {
    reserve(vehicle: Vehicle): void {
        console.log('Vehicle reserved.');
        vehicle.setState(new ReservedState());
    }

    activate(vehicle: Vehicle): void {
        throw new Error('Cannot activate an available vehicle. It must be reserved first.');
    }

    returnVehicle(vehicle: Vehicle): void {
        throw new Error('Vehicle is already available.');
    }

    sendToMaintenance(vehicle: Vehicle): void {
        console.log('Vehicle sent to maintenance.');
        vehicle.setState(new MaintenanceState());
    }

    retire(vehicle: Vehicle): void {
        console.log('Vehicle retired.');
        vehicle.setState(new RetiredState());
    }

    getStateName(): string {
        return 'AVAILABLE';
    }
}
