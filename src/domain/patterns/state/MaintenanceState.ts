import { VehicleState } from './VehicleState.interface';
import { Vehicle } from '../../entities/Vehicle';
import { AvailableState } from './AvailableState';
import { RetiredState } from './RetiredState';

export class MaintenanceState implements VehicleState {
    reserve(vehicle: Vehicle): void {
        throw new Error('Vehicle is in maintenance.');
    }

    activate(vehicle: Vehicle): void {
        throw new Error('Vehicle is in maintenance.');
    }

    returnVehicle(vehicle: Vehicle): void {
        throw new Error('Vehicle is in maintenance, not rented.');
    }

    sendToMaintenance(vehicle: Vehicle): void {
        throw new Error('Vehicle is already in maintenance.');
    }

    // Maintenance finished
    releaseFromMaintenance(vehicle: Vehicle): void {
        console.log('Maintenance completed. Vehicle back in service.');
        vehicle.setState(new AvailableState());
    }

    retire(vehicle: Vehicle): void {
        console.log('Vehicle retired directly from maintenance.');
        vehicle.setState(new RetiredState());
    }

    getStateName(): string {
        return 'MAINTENANCE';
    }
}
