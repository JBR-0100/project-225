import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../infrastructure/Logger';
import { VehicleState } from '../patterns/state/VehicleState.interface';
import { AvailableState } from '../patterns/state/AvailableState';
import { VehicleType } from '../types/enums';

export abstract class Vehicle {
    private vehicleId: string;
    private make: string;
    private model: string;
    private year: number;
    private licensePlate: string;
    private mileageKm: number;
    private dailyRate: number;
    private location: string;
    private state: VehicleState;

    constructor(
        make: string,
        model: string,
        year: number,
        licensePlate: string,
        dailyRate: number,
        location: string = 'HQ'
    ) {
        this.vehicleId = uuidv4();
        this.make = make;
        this.model = model;
        this.year = year;
        this.licensePlate = licensePlate;
        this.dailyRate = dailyRate;
        this.location = location;
        this.mileageKm = 0;
        this.state = new AvailableState(); // Default state
    }

    // Getters
    getVehicleId(): string { return this.vehicleId; }
    getMake(): string { return this.make; }
    getModel(): string { return this.model; }
    getYear(): number { return this.year; }
    getLicensePlate(): string { return this.licensePlate; }
    getDailyRate(): number { return this.dailyRate; }
    getMileage(): number { return this.mileageKm; }
    getLocation(): string { return this.location; }
    getState(): VehicleState { return this.state; }

    // State Transitions (delegated to State object)
    setState(newState: VehicleState): void {
        Logger.info(`Transitioning state: ${this.state.getStateName()} -> ${newState.getStateName()}`, {
            vehicleId: this.vehicleId,
            oldState: this.state.getStateName(),
            newState: newState.getStateName()
        });
        this.state = newState;
    }

    reserve(): void {
        this.state.reserve(this);
    }

    activateRental(): void {
        this.state.activate(this);
    }

    returnVehicle(mileageAdded: number): void {
        this.updateMileage(mileageAdded);
        this.state.returnVehicle(this);
    }

    sendToMaintenance(): void {
        this.state.sendToMaintenance(this);
    }

    retire(): void {
        this.state.retire(this);
    }

    updateMileage(km: number): void {
        if (km < 0) throw new Error('Mileage cannot be negative.');
        this.mileageKm += km;
        Logger.info(`Mileage updated for vehicle ${this.vehicleId}. New total: ${this.mileageKm} km`);
    }

    // Abstract methods to be implemented by subclasses
    abstract getVehicleType(): VehicleType;
    abstract getSpecifications(): Record<string, any>;
}
