import { VehicleState } from './VehicleState.interface';
import { Vehicle } from '../../entities/Vehicle';
import { RentedState } from './RentedState';
import { AvailableState } from './AvailableState';

export class ReservedState implements VehicleState {
    reserve(vehicle: Vehicle): void {
        throw new Error('Vehicle is already reserved.');
    }

    activate(vehicle: Vehicle): void {
        console.log('Rental activated. Vehicle is now on the road.');
        vehicle.setState(new RentedState());
    }

    returnVehicle(vehicle: Vehicle): void {
        throw new Error('Cannot return a reserved vehicle. Cancel the reservation instead.');
    }

    sendToMaintenance(vehicle: Vehicle): void {
        throw new Error('Cannot send reserved vehicle to maintenance. Cancel reservation first.');
    }

    retire(vehicle: Vehicle): void {
        throw new Error('Cannot retire a reserved vehicle.');
    }

    // Custom method for cancellation
    cancelReservation(vehicle: Vehicle): void {
        console.log('Reservation cancelled.');
        vehicle.setState(new AvailableState());
    }

    getStateName(): string {
        return 'RESERVED';
    }
}
